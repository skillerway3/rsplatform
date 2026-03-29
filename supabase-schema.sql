-- Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  is_verified_seller BOOLEAN DEFAULT FALSE,
  is_trusted_seller BOOLEAN DEFAULT FALSE,
  average_rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  manual_trusted_override BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'user',
  username_updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to enforce 30-day username change restriction and prevent reserved usernames
CREATE OR REPLACE FUNCTION public.check_username_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent reserved usernames if it's a new username or an update to a different reserved username
  IF NEW.username IS NOT NULL AND LOWER(NEW.username) IN ('admin', 'support', 'rsplatform') THEN
    IF TG_OP = 'INSERT' THEN
      RAISE EXCEPTION 'Username "%" is reserved and cannot be used.', NEW.username;
    ELSIF TG_OP = 'UPDATE' THEN
      IF OLD.username IS NULL OR LOWER(OLD.username) != LOWER(NEW.username) THEN
        RAISE EXCEPTION 'Username "%" is reserved and cannot be used.', NEW.username;
      END IF;
    END IF;
  END IF;

  -- Handle 30-day username change restriction
  IF TG_OP = 'UPDATE' AND OLD.username IS NOT NULL AND NEW.username != OLD.username THEN
    IF OLD.username_updated_at IS NOT NULL AND (NOW() - OLD.username_updated_at) < INTERVAL '30 days' THEN
      RAISE EXCEPTION 'You can only change your username once every 30 days. Please wait % more days.', 
        30 - EXTRACT(DAY FROM (NOW() - OLD.username_updated_at));
    END IF;
    NEW.username_updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_username_update
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.check_username_update();

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seller Verifications Table
CREATE TABLE IF NOT EXISTS seller_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  phone_number TEXT NOT NULL,
  document_type TEXT NOT NULL, -- id, driver_license, passport
  id_front_url TEXT NOT NULL,
  id_back_url TEXT NOT NULL,
  selfie_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, suspended
  admin_notes TEXT,
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to update is_verified_seller on approval
CREATE OR REPLACE FUNCTION public.handle_verification_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE public.profiles
    SET is_verified_seller = TRUE
    WHERE id = NEW.user_id;
  ELSIF NEW.status != 'approved' AND OLD.status = 'approved' THEN
    UPDATE public.profiles
    SET is_verified_seller = FALSE
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_verification_updated
  AFTER UPDATE ON public.seller_verifications
  FOR EACH ROW EXECUTE FUNCTION public.handle_verification_update();

-- Listings Table
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  game TEXT NOT NULL,
  category TEXT NOT NULL,
  images TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'active', -- active, sold, hidden
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buyer Requests Table
CREATE TABLE IF NOT EXISTS buyer_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES auth.users(id) NOT NULL,
  category TEXT NOT NULL,
  game TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  service_type TEXT,
  section TEXT,
  summary_json JSONB,
  notes TEXT,
  options JSONB,
  budget_min NUMERIC,
  budget_max NUMERIC,
  status TEXT DEFAULT 'open', -- open, closed, matched, in_progress, delivered, resolved, refunded, disputed, expired
  accepted_offer_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Buyer Request Offers Table
CREATE TABLE IF NOT EXISTS buyer_request_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES buyer_requests(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES auth.users(id) NOT NULL,
  price NUMERIC NOT NULL,
  delivery_time TEXT NOT NULL, -- e.g., "2 days"
  message TEXT,
  status TEXT DEFAULT 'pending', -- pending, accepted, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES auth.users(id) NOT NULL,
  seller_id UUID REFERENCES auth.users(id) NOT NULL,
  listing_id UUID REFERENCES listings(id),
  request_id UUID REFERENCES buyer_requests(id),
  offer_id UUID REFERENCES buyer_request_offers(id),
  total_price NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, processing, delivered, completed, cancelled, refunded, disputed
  payment_id TEXT,
  payment_provider TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  platform_fee NUMERIC DEFAULT 0,
  seller_payout NUMERIC DEFAULT 0,
  decline_reason TEXT,
  extra_time_requested_at TIMESTAMP WITH TIME ZONE,
  extra_time_reason TEXT,
  extra_time_hours INTEGER,
  extra_time_status TEXT, -- pending, accepted, declined
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  deadline_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE
);

-- Buyer Request Proofs Table
CREATE TABLE IF NOT EXISTS buyer_request_proofs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES auth.users(id) NOT NULL,
  file_url TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Threads for Requests
CREATE TABLE IF NOT EXISTS buyer_request_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES buyer_requests(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES auth.users(id) NOT NULL,
  seller_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(request_id, buyer_id, seller_id)
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS buyer_request_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES buyer_request_threads(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seller Reviews Table
CREATE TABLE IF NOT EXISTS seller_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL UNIQUE,
  seller_id UUID REFERENCES auth.users(id) NOT NULL,
  buyer_id UUID REFERENCES auth.users(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RPC for accepting an offer atomically
-- Trigger to update profile rating stats on new review
CREATE OR REPLACE FUNCTION public.handle_new_review()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating NUMERIC;
  cnt INTEGER;
  v_seller_id UUID;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    v_seller_id := OLD.seller_id;
  ELSE
    v_seller_id := NEW.seller_id;
  END IF;

  SELECT COALESCE(AVG(rating), 0)::NUMERIC(3,2), COUNT(*)
  INTO avg_rating, cnt
  FROM public.seller_reviews
  WHERE seller_id = v_seller_id;

  UPDATE public.profiles
  SET 
    average_rating = avg_rating,
    review_count = cnt,
    is_trusted_seller = (manual_trusted_override OR (cnt >= 10 AND avg_rating >= 4.5))
  WHERE id = v_seller_id;

  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_review_created ON public.seller_reviews;
CREATE TRIGGER on_review_created
  AFTER INSERT OR UPDATE OR DELETE ON public.seller_reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_review();

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Admin policy for profiles
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
CREATE POLICY "Admins can update any profile" ON profiles FOR UPDATE USING (
  is_admin(auth.uid())
);

-- Trigger to prevent non-admins from updating sensitive profile fields
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- If not admin, reset sensitive fields to OLD values
  IF NOT (
    is_admin(auth.uid())
  ) THEN
    NEW.is_verified_seller := OLD.is_verified_seller;
    NEW.is_trusted_seller := OLD.is_trusted_seller;
    NEW.manual_trusted_override := OLD.manual_trusted_override;
    NEW.average_rating := OLD.average_rating;
    NEW.review_count := OLD.review_count;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_update_protect ON public.profiles;
CREATE TRIGGER on_profile_update_protect
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();

-- Trigger to recalculate is_trusted_seller when manual_trusted_override changes
CREATE OR REPLACE FUNCTION public.handle_profile_trust_update()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.manual_trusted_override IS DISTINCT FROM NEW.manual_trusted_override) THEN
    NEW.is_trusted_seller := (NEW.manual_trusted_override OR (NEW.review_count >= 10 AND NEW.average_rating >= 4.5));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_trust_update ON public.profiles;
CREATE TRIGGER on_profile_trust_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_profile_trust_update();

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Listings are viewable by everyone" ON listings;
CREATE POLICY "Listings are viewable by everyone" ON listings FOR SELECT USING (status = 'active');
DROP POLICY IF EXISTS "Sellers can manage own listings" ON listings;
CREATE POLICY "Sellers can manage own listings" ON listings FOR ALL USING (auth.uid() = seller_id);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
DROP POLICY IF EXISTS "Buyers can create orders" ON orders;
CREATE POLICY "Buyers can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
DROP POLICY IF EXISTS "Sellers can mark delivered" ON orders;
CREATE POLICY "Sellers can mark delivered" ON orders FOR UPDATE USING (
  auth.uid() = seller_id AND status = 'processing'
) WITH CHECK (
  status = 'delivered'
);
DROP POLICY IF EXISTS "Buyers can complete or dispute" ON orders;
CREATE POLICY "Buyers can complete or dispute" ON orders FOR UPDATE USING (
  auth.uid() = buyer_id AND status = 'delivered'
) WITH CHECK (
  status IN ('completed', 'disputed')
);

ALTER TABLE seller_verifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own verification" ON seller_verifications;
CREATE POLICY "Users can view own verification" ON seller_verifications FOR SELECT USING (
  auth.uid() = user_id OR 
  is_admin(auth.uid())
);
DROP POLICY IF EXISTS "Users can insert own verification" ON seller_verifications;
CREATE POLICY "Users can insert own verification" ON seller_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own verification" ON seller_verifications;
CREATE POLICY "Users can update own verification" ON seller_verifications FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can update verifications" ON seller_verifications;
CREATE POLICY "Admins can update verifications" ON seller_verifications FOR UPDATE USING (
  is_admin(auth.uid())
);
DROP POLICY IF EXISTS "Admins can manage all verifications" ON seller_verifications;
CREATE POLICY "Admins can manage all verifications" ON seller_verifications FOR ALL USING (
  is_admin(auth.uid())
);

-- Admin policy for manual_trusted_override
DROP POLICY IF EXISTS "Admins can update trusted override" ON profiles;
CREATE POLICY "Admins can update trusted override" ON profiles FOR UPDATE USING (
  is_admin(auth.uid())
);

ALTER TABLE buyer_request_proofs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view proofs for their orders" ON buyer_request_proofs;
CREATE POLICY "Users can view proofs for their orders" ON buyer_request_proofs FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE id = order_id AND (auth.uid() = buyer_id OR auth.uid() = seller_id))
);
DROP POLICY IF EXISTS "Sellers can insert proofs for their orders" ON buyer_request_proofs;
CREATE POLICY "Sellers can insert proofs for their orders" ON buyer_request_proofs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE id = order_id AND auth.uid() = seller_id)
);

ALTER TABLE buyer_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Buyers can manage their own requests" ON buyer_requests;
CREATE POLICY "Buyers can manage their own requests" ON buyer_requests FOR ALL USING (auth.uid() = buyer_id);
DROP POLICY IF EXISTS "Sellers can view open requests" ON buyer_requests;
CREATE POLICY "Sellers can view open requests" ON buyer_requests FOR SELECT USING (
  status = 'open' OR 
  auth.uid() = (SELECT seller_id FROM buyer_request_offers WHERE id = accepted_offer_id)
);

ALTER TABLE buyer_request_offers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Sellers can manage their own offers" ON buyer_request_offers;
CREATE POLICY "Sellers can manage their own offers" ON buyer_request_offers FOR ALL USING (auth.uid() = seller_id);
DROP POLICY IF EXISTS "Buyers can view offers for their requests" ON buyer_request_offers;
CREATE POLICY "Buyers can view offers for their requests" ON buyer_request_offers FOR SELECT USING (
  EXISTS (SELECT 1 FROM buyer_requests WHERE id = request_id AND auth.uid() = buyer_id)
);
DROP POLICY IF EXISTS "Verified sellers can create offers" ON buyer_request_offers;
CREATE POLICY "Verified sellers can create offers" ON buyer_request_offers FOR INSERT WITH CHECK (
  auth.uid() = seller_id AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_verified_seller = true) AND
  EXISTS (SELECT 1 FROM buyer_requests WHERE id = request_id AND status = 'open' AND expires_at > NOW())
);

ALTER TABLE buyer_request_threads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own threads" ON buyer_request_threads;
CREATE POLICY "Users can view their own threads" ON buyer_request_threads FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
DROP POLICY IF EXISTS "Users can insert their own threads" ON buyer_request_threads;
CREATE POLICY "Users can insert their own threads" ON buyer_request_threads FOR INSERT WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

ALTER TABLE buyer_request_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view messages in their threads" ON buyer_request_messages;
CREATE POLICY "Users can view messages in their threads" ON buyer_request_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM buyer_request_threads WHERE id = thread_id AND (auth.uid() = buyer_id OR auth.uid() = seller_id))
);
DROP POLICY IF EXISTS "Users can insert messages in their threads" ON buyer_request_messages;
CREATE POLICY "Users can insert messages in their threads" ON buyer_request_messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND EXISTS (SELECT 1 FROM buyer_request_threads WHERE id = thread_id AND (auth.uid() = buyer_id OR auth.uid() = seller_id))
);

ALTER TABLE seller_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON seller_reviews;
CREATE POLICY "Reviews are viewable by everyone" ON seller_reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Buyers can insert reviews for their completed orders" ON seller_reviews;
CREATE POLICY "Buyers can insert reviews for their completed orders" ON seller_reviews FOR INSERT WITH CHECK (
  auth.uid() = buyer_id AND 
  EXISTS (
    SELECT 1 FROM orders 
    WHERE id = order_id AND buyer_id = auth.uid() AND status IN ('completed', 'resolved')
  )
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- new_offer, offer_accepted, order_delivered, order_completed, new_message, system
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own notifications" ON notifications;
CREATE POLICY "Users can manage their own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- Storage Policies for 'verifications' bucket
-- Note: These assume the bucket exists. They apply to storage.objects.
-- We use path segments to identify ownership.

-- 1. Allow users to upload to their own folder in verifications
DROP POLICY IF EXISTS "Users can upload their own verifications" ON storage.objects;
CREATE POLICY "Users can upload their own verifications" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'verifications' AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 2. Allow users to view their own verifications
DROP POLICY IF EXISTS "Users can view their own verifications" ON storage.objects;
CREATE POLICY "Users can view their own verifications" ON storage.objects FOR SELECT USING (
  bucket_id = 'verifications' AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 3. Allow admins to view all verifications
DROP POLICY IF EXISTS "Admins can view all verifications" ON storage.objects;
CREATE POLICY "Admins can view all verifications" ON storage.objects FOR SELECT USING (
  bucket_id = 'verifications' AND (
    is_admin(auth.uid())
  )
);

-- 4. Allow admins to manage all verifications
DROP POLICY IF EXISTS "Admins can manage all verifications" ON storage.objects;
CREATE POLICY "Admins can manage all verifications" ON storage.objects FOR ALL USING (
  bucket_id = 'verifications' AND (
    is_admin(auth.uid())
  )
);

-- 4. Allow sellers to upload proofs (prefixed with order_id)
-- Path: proofs/{order_id}/{filename}
DROP POLICY IF EXISTS "Sellers can upload proofs" ON storage.objects;
CREATE POLICY "Sellers can upload proofs" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'verifications' AND 
  (storage.foldername(name))[1] = 'proofs' AND
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE id::text = (storage.foldername(name))[2] AND seller_id = auth.uid()
  )
);

-- 5. Allow buyers and sellers to view proofs
DROP POLICY IF EXISTS "Users can view proofs" ON storage.objects;
CREATE POLICY "Users can view proofs" ON storage.objects FOR SELECT USING (
  bucket_id = 'verifications' AND 
  (storage.foldername(name))[1] = 'proofs' AND
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE id::text = (storage.foldername(name))[2] AND (buyer_id = auth.uid() OR seller_id = auth.uid())
  )
);

-- 6. Avatars bucket policies
-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow everyone to view avatars
DROP POLICY IF EXISTS "Avatars are publicly viewable" ON storage.objects;
CREATE POLICY "Avatars are publicly viewable" ON storage.objects FOR SELECT USING (
  bucket_id = 'avatars'
);

-- Allow users to upload their own avatar
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Allow users to update their own avatar
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (
  bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]
);

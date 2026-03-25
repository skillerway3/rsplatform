-- 1. Roles & Admin Foundation
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM profiles WHERE id = user_id AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Operational Logging
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_code TEXT UNIQUE;

-- Function to generate order code
CREATE OR REPLACE FUNCTION generate_order_code() RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  done BOOLEAN DEFAULT FALSE;
BEGIN
  WHILE NOT done LOOP
    new_code := 'RSP-' || to_char(NOW(), 'YYYYMMDD') || '-' || upper(substr(md5(random()::text), 1, 4));
    IF NOT EXISTS (SELECT 1 FROM orders WHERE order_code = new_code) THEN
      done := TRUE;
    END IF;
  END LOOP;
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set order code on insert
CREATE OR REPLACE FUNCTION set_order_code() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_code IS NULL THEN
    NEW.order_code := generate_order_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_order_insert_code ON orders;
CREATE TRIGGER on_order_insert_code
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION set_order_code();

-- Transaction Logs Table
CREATE TABLE IF NOT EXISTS transaction_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  order_code TEXT,
  user_id UUID REFERENCES auth.users(id),
  actor_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL, -- payment_captured, payment_refunded, payout_sent, dispute_opened, etc.
  amount NUMERIC,
  platform_fee NUMERIC,
  seller_payout NUMERIC,
  payment_provider TEXT,
  payment_reference TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Activity Logs Table
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES auth.users(id) NOT NULL,
  target_id UUID, -- user_id, order_id, listing_id, etc.
  target_type TEXT, -- user, order, listing, verification, etc.
  action_type TEXT NOT NULL, -- user_suspended, listing_removed, verification_approved, etc.
  old_value JSONB,
  new_value JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Status History Table
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Support System
CREATE TABLE IF NOT EXISTS support_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id), -- NULL for guests
  guest_email TEXT,
  guest_name TEXT,
  subject TEXT,
  category TEXT,
  status TEXT DEFAULT 'open', -- open, waiting_user, waiting_admin, closed
  priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
  assigned_to UUID REFERENCES auth.users(id),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES support_threads(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id), -- NULL for guests or system
  sender_type TEXT NOT NULL, -- user, admin, system
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Moderation
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS suspension_reason TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS moderation_notes TEXT;

ALTER TABLE listings ADD COLUMN IF NOT EXISTS moderation_notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS moderation_notes TEXT;

-- RLS Policies for Support
ALTER TABLE support_threads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own support threads" ON support_threads;
CREATE POLICY "Users can view own support threads" ON support_threads FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));
DROP POLICY IF EXISTS "Users can create support threads" ON support_threads;
CREATE POLICY "Users can create support threads" ON support_threads FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
DROP POLICY IF EXISTS "Admins can manage all support threads" ON support_threads;
CREATE POLICY "Admins can manage all support threads" ON support_threads FOR ALL USING (is_admin(auth.uid()));

ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view messages in own threads" ON support_messages;
CREATE POLICY "Users can view messages in own threads" ON support_messages FOR SELECT USING (EXISTS (SELECT 1 FROM support_threads WHERE id = thread_id AND (user_id = auth.uid() OR is_admin(auth.uid()))));
DROP POLICY IF EXISTS "Users can insert messages in own threads" ON support_messages;
CREATE POLICY "Users can insert messages in own threads" ON support_messages FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM support_threads WHERE id = thread_id AND (user_id = auth.uid() OR is_admin(auth.uid()))));

-- Update existing triggers to use role check
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- If not admin, reset sensitive fields to OLD values
  IF NOT (is_admin(auth.uid())) THEN
    NEW.is_verified_seller := OLD.is_verified_seller;
    NEW.is_trusted_seller := OLD.is_trusted_seller;
    NEW.manual_trusted_override := OLD.manual_trusted_override;
    NEW.average_rating := OLD.average_rating;
    NEW.review_count := OLD.review_count;
    NEW.role := OLD.role;
    NEW.is_suspended := OLD.is_suspended;
    NEW.suspension_reason := OLD.suspension_reason;
    NEW.moderation_notes := OLD.moderation_notes;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update other admin policies to use is_admin()
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
CREATE POLICY "Admins can update any profile" ON profiles FOR UPDATE USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update verifications" ON seller_verifications;
CREATE POLICY "Admins can update verifications" ON seller_verifications FOR UPDATE USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all verifications" ON seller_verifications;
CREATE POLICY "Admins can manage all verifications" ON seller_verifications FOR ALL USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all verifications" ON storage.objects;
CREATE POLICY "Admins can view all verifications" ON storage.objects FOR SELECT USING (
  bucket_id = 'verifications' AND is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins can manage all verifications" ON storage.objects;
CREATE POLICY "Admins can manage all verifications" ON storage.objects FOR ALL USING (
  bucket_id = 'verifications' AND is_admin(auth.uid())
);

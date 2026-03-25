-- 1. Profile Enhancements
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Function to sync email verification status from auth.users
CREATE OR REPLACE FUNCTION public.sync_email_verification()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET email_verified = (NEW.email_confirmed_at IS NOT NULL)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users update
DROP TRIGGER IF EXISTS on_auth_user_email_verify ON auth.users;
CREATE TRIGGER on_auth_user_email_verify
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_email_verification();

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_email_verify_insert ON auth.users;
CREATE TRIGGER on_auth_user_email_verify_insert
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_email_verification();

-- Initial sync for existing users
UPDATE public.profiles p
SET email_verified = (u.email_confirmed_at IS NOT NULL)
FROM auth.users u
WHERE p.id = u.id;

-- 2. Disputes Table
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  raised_by UUID REFERENCES auth.users(id) NOT NULL,
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_urls TEXT[],
  status TEXT DEFAULT 'open', -- open, under_review, resolved, closed
  resolution TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own disputes" ON disputes FOR SELECT USING (auth.uid() = raised_by OR EXISTS (SELECT 1 FROM orders WHERE id = order_id AND (auth.uid() = buyer_id OR auth.uid() = seller_id)) OR is_admin(auth.uid()));
CREATE POLICY "Users can create disputes" ON disputes FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE id = order_id AND (auth.uid() = buyer_id OR auth.uid() = seller_id)));
CREATE POLICY "Admins can manage disputes" ON disputes FOR ALL USING (is_admin(auth.uid()));

-- 3. SEO Config Table
CREATE TABLE IF NOT EXISTS seo_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_path TEXT UNIQUE NOT NULL,
  title TEXT,
  description TEXT,
  keywords TEXT[],
  og_image TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE seo_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "SEO config is publicly viewable" ON seo_config FOR SELECT USING (true);
CREATE POLICY "Admins can manage SEO config" ON seo_config FOR ALL USING (is_admin(auth.uid()));

-- 4. Storage Buckets & Policies
-- Ensure buckets exist
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('verifications', 'verifications', false) ON CONFLICT (id) DO NOTHING;

-- Avatars Policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload avatars" ON storage.objects;
CREATE POLICY "Users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can update avatars" ON storage.objects;
CREATE POLICY "Users can update avatars" ON storage.objects FOR UPDATE USING (
  bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Verifications Policies (Private)
DROP POLICY IF EXISTS "Admins can view all verifications" ON storage.objects;
CREATE POLICY "Admins can view all verifications" ON storage.objects FOR SELECT USING (
  bucket_id = 'verifications' AND is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Users can view own verifications" ON storage.objects;
CREATE POLICY "Users can view own verifications" ON storage.objects FOR SELECT USING (
  bucket_id = 'verifications' AND (auth.uid())::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can upload verifications" ON storage.objects;
CREATE POLICY "Users can upload verifications" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'verifications' AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 5. Fix Support Messages Schema Mismatch
-- Ensure columns exist
ALTER TABLE support_messages ADD COLUMN IF NOT EXISTS sender_type TEXT DEFAULT 'user';
ALTER TABLE support_messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

-- 6. Admin Activity Logs - Ensure consistent action types
-- No changes needed to schema, but code must use consistent values.

-- 7. Order Status History - Ensure old_status and new_status
-- Already in migration 20260325_admin_and_support.sql

-- 8. Seller Verifications - Ensure document_type
-- Already in supabase-schema.sql

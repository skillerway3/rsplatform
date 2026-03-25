-- 1. Wallet Transaction Enhancements
ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS external_id TEXT;
ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS processed_by UUID REFERENCES auth.users(id);
ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Unique index to prevent duplicate PayPal credits
CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_transactions_external_id ON wallet_transactions (external_id) WHERE external_id IS NOT NULL;

-- 2. Replace Hardcoded Admin Email with is_admin() check
-- We need to update existing policies in supabase-schema.sql or migrations

-- Seller Verifications
DROP POLICY IF EXISTS "Users can view own verification" ON seller_verifications;
CREATE POLICY "Users can view own verification" ON seller_verifications FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update verifications" ON seller_verifications;
CREATE POLICY "Admins can update verifications" ON seller_verifications FOR UPDATE USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all verifications" ON seller_verifications;
CREATE POLICY "Admins can manage all verifications" ON seller_verifications FOR ALL USING (is_admin(auth.uid()));

-- Storage Policies
DROP POLICY IF EXISTS "Admins can view all verifications" ON storage.objects;
CREATE POLICY "Admins can view all verifications" ON storage.objects FOR SELECT USING (
  bucket_id = 'verifications' AND is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins can manage all verifications" ON storage.objects;
CREATE POLICY "Admins can manage all verifications" ON storage.objects FOR ALL USING (
  bucket_id = 'verifications' AND is_admin(auth.uid())
);

-- Profiles
DROP POLICY IF EXISTS "Admins can update trusted override" ON profiles;
CREATE POLICY "Admins can update trusted override" ON profiles FOR UPDATE USING (is_admin(auth.uid()));

-- 3. Ensure is_admin function is robust
CREATE OR REPLACE FUNCTION is_admin(user_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Fix transaction_logs RLS (if missing)
ALTER TABLE transaction_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view all transaction logs" ON transaction_logs;
CREATE POLICY "Admins can view all transaction logs" ON transaction_logs FOR SELECT USING (is_admin(auth.uid()));

-- 5. Fix admin_activity_logs RLS
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view all activity logs" ON admin_activity_logs;
CREATE POLICY "Admins can view all activity logs" ON admin_activity_logs FOR SELECT USING (is_admin(auth.uid()));

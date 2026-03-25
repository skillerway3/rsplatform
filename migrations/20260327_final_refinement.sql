-- 1. Robust Admin Check
CREATE OR REPLACE FUNCTION is_admin(user_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM profiles WHERE id = user_id AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Support System Enhancements
ALTER TABLE support_threads ADD COLUMN IF NOT EXISTS guest_session_id UUID;
CREATE INDEX IF NOT EXISTS idx_support_threads_guest_session ON support_threads(guest_session_id);

-- Update Support RLS for Guests
DROP POLICY IF EXISTS "Users can view own support threads" ON support_threads;
CREATE POLICY "Users can view own support threads" ON support_threads 
FOR SELECT USING (
  auth.uid() = user_id 
  OR is_admin(auth.uid())
  -- Note: Guests will use a server-side route or we can allow select if guest_session_id matches
  -- For now, we'll keep it restricted to auth or admin, and handle guests via API
);

DROP POLICY IF EXISTS "Users can create support threads" ON support_threads;
CREATE POLICY "Users can create support threads" ON support_threads 
FOR INSERT WITH CHECK (
  auth.uid() = user_id 
  OR user_id IS NULL -- Allow guest creation
);

-- Support Messages RLS
DROP POLICY IF EXISTS "Users can view messages in own threads" ON support_messages;
CREATE POLICY "Users can view messages in own threads" ON support_messages 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM support_threads 
    WHERE id = thread_id 
    AND (user_id = auth.uid() OR is_admin(auth.uid()))
  )
);

DROP POLICY IF EXISTS "Users can insert messages in own threads" ON support_messages;
CREATE POLICY "Users can insert messages in own threads" ON support_messages 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM support_threads 
    WHERE id = thread_id 
    AND (user_id = auth.uid() OR is_admin(auth.uid()))
  )
);

-- 3. Fix Storage Policies (Remove hardcoded email)
DROP POLICY IF EXISTS "Admins can view all verifications" ON storage.objects;
CREATE POLICY "Admins can view all verifications" ON storage.objects FOR SELECT USING (
  bucket_id = 'verifications' AND is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins can manage all verifications" ON storage.objects;
CREATE POLICY "Admins can manage all verifications" ON storage.objects FOR ALL USING (
  bucket_id = 'verifications' AND is_admin(auth.uid())
);

-- 4. Audit Trail Enhancements
-- Ensure admin_activity_logs has target_type and target_id
-- Already exists.

-- 5. Finalize Support Messages Schema
-- Remove is_admin_reply if it was accidentally added (it shouldn't be there based on previous migrations)
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='support_messages' AND column_name='is_admin_reply') THEN
    ALTER TABLE support_messages DROP COLUMN is_admin_reply;
  END IF;
END $$;

-- 6. Ensure Disputes Table has correct foreign key references
-- The code uses 'raised_by' which is correct.

-- 7. SEO Config - Seed initial data if needed
INSERT INTO seo_config (page_path, title, description)
VALUES ('/', 'RSPlatform - Premium OSRS Marketplace', 'Buy and sell OSRS gold, items, and accounts securely.')
ON CONFLICT (page_path) DO NOTHING;

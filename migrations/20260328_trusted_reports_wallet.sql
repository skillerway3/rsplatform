-- 1. User Reports Table
CREATE TABLE IF NOT EXISTS user_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES auth.users(id) NOT NULL,
  reported_user_id UUID REFERENCES auth.users(id) NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  evidence_urls TEXT[],
  status TEXT DEFAULT 'pending', -- pending, reviewing, resolved, dismissed
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own reports" ON user_reports FOR SELECT USING (auth.uid() = reporter_id OR is_admin(auth.uid()));
CREATE POLICY "Users can create reports" ON user_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admins can manage user reports" ON user_reports FOR ALL USING (is_admin(auth.uid()));

-- 2. Platform Reports Table (Report a Problem)
CREATE TABLE IF NOT EXISTS platform_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id), -- Optional, can be anonymous if we allow it, but here we require auth for now
  category TEXT NOT NULL, -- technical, payment, account, other
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_urls TEXT[],
  status TEXT DEFAULT 'pending', -- pending, investigating, resolved, closed
  admin_notes TEXT,
  priority TEXT DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE platform_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own platform reports" ON platform_reports FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));
CREATE POLICY "Users can create platform reports" ON platform_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage platform reports" ON platform_reports FOR ALL USING (is_admin(auth.uid()));

-- 3. Wallet / Balance Enhancements
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS balance NUMERIC DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pending_balance NUMERIC DEFAULT 0;

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL, -- deposit, withdrawal, sale_proceeds, purchase, refund, fee
  status TEXT DEFAULT 'completed', -- pending, completed, failed, cancelled
  description TEXT,
  reference_id UUID, -- order_id or other reference
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON wallet_transactions FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));
CREATE POLICY "Admins can manage all transactions" ON wallet_transactions FOR ALL USING (is_admin(auth.uid()));

-- 4. Automated Notifications Triggers

-- Notify user when trusted status changes
CREATE OR REPLACE FUNCTION public.notify_on_trust_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.manual_trusted_override IS DISTINCT FROM NEW.manual_trusted_override) THEN
    IF (NEW.manual_trusted_override = TRUE) THEN
      INSERT INTO notifications (user_id, type, title, content, link)
      VALUES (
        NEW.id,
        'system',
        'Trusted Seller Status Granted',
        'Congratulations! You have been granted Trusted Seller status by the administration.',
        '/profile'
      );
    ELSE
      INSERT INTO notifications (user_id, type, title, content, link)
      VALUES (
        NEW.id,
        'system',
        'Trusted Seller Status Revoked',
        'Your Trusted Seller status has been revoked by the administration.',
        '/profile'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_trust_notify ON public.profiles;
CREATE TRIGGER on_profile_trust_notify
  AFTER UPDATE OF manual_trusted_override ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_trust_change();

-- Notify admin on new seller verification submission
CREATE OR REPLACE FUNCTION public.notify_admin_on_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for all admins
  INSERT INTO notifications (user_id, type, title, content, link)
  SELECT id, 'system', 'New Seller Verification', 'A user has submitted a new seller verification request.', '/admin/verifications'
  FROM profiles
  WHERE role = 'admin';
  
  -- Also log in admin activity if needed, but notification is more direct
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_verification_submitted_notify ON public.seller_verifications;
CREATE TRIGGER on_verification_submitted_notify
  AFTER INSERT ON public.seller_verifications
  FOR EACH ROW EXECUTE FUNCTION public.notify_admin_on_verification();

-- Notify admin on new user report
CREATE OR REPLACE FUNCTION public.notify_admin_on_user_report()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, content, link)
  SELECT id, 'system', 'New User Report', 'A user has been reported for misconduct.', '/admin/reports'
  FROM profiles
  WHERE role = 'admin';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_report_submitted_notify ON public.user_reports;
CREATE TRIGGER on_user_report_submitted_notify
  AFTER INSERT ON public.user_reports
  FOR EACH ROW EXECUTE FUNCTION public.notify_admin_on_user_report();

-- Notify admin on new platform report
CREATE OR REPLACE FUNCTION public.notify_admin_on_platform_report()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, content, link)
  SELECT id, 'system', 'New Platform Problem Report', 'A new platform problem has been reported.', '/admin/support'
  FROM profiles
  WHERE role = 'admin';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_platform_report_submitted_notify ON public.platform_reports;
CREATE TRIGGER on_platform_report_submitted_notify
  AFTER INSERT ON public.platform_reports
  FOR EACH ROW EXECUTE FUNCTION public.notify_admin_on_platform_report();

-- 5. Admin Activity Log for Trust Changes
CREATE OR REPLACE FUNCTION public.log_trust_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.manual_trusted_override IS DISTINCT FROM NEW.manual_trusted_override) THEN
    INSERT INTO admin_activity_logs (admin_id, target_id, target_type, action_type, old_value, new_value)
    VALUES (
      auth.uid(),
      NEW.id,
      'user',
      CASE WHEN NEW.manual_trusted_override THEN 'trust_granted' ELSE 'trust_revoked' END,
      jsonb_build_object('manual_trusted_override', OLD.manual_trusted_override),
      jsonb_build_object('manual_trusted_override', NEW.manual_trusted_override)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_trust_log ON public.profiles;
CREATE TRIGGER on_profile_trust_log
  AFTER UPDATE OF manual_trusted_override ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_trust_change();


-- Migration: Schema Integrity and Admin Policies
-- Date: 2026-04-03

-- 1. Add updated_at column to tables that are missing it
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.support_threads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.support_messages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Create trigger function for updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Add triggers for updated_at
DROP TRIGGER IF EXISTS on_profile_updated_at ON public.profiles;
CREATE TRIGGER on_profile_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS on_listing_updated_at ON public.listings;
CREATE TRIGGER on_listing_updated_at
    BEFORE UPDATE ON public.listings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS on_order_updated_at ON public.orders;
CREATE TRIGGER on_order_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS on_support_thread_updated_at ON public.support_threads;
CREATE TRIGGER on_support_thread_updated_at
    BEFORE UPDATE ON public.support_threads
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS on_support_message_updated_at ON public.support_messages;
CREATE TRIGGER on_support_message_updated_at
    BEFORE UPDATE ON public.support_messages
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Update protect_profile_fields to include balance and total_earned
-- This prevents users from manually updating their balance via the profiles table
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- If not admin, reset sensitive fields to OLD values
  IF NOT (public.is_admin(auth.uid())) THEN
    NEW.is_verified_seller := OLD.is_verified_seller;
    NEW.is_trusted_seller := OLD.is_trusted_seller;
    NEW.manual_trusted_override := OLD.manual_trusted_override;
    NEW.average_rating := OLD.average_rating;
    NEW.review_count := OLD.review_count;
    NEW.role := OLD.role;
    NEW.is_suspended := OLD.is_suspended;
    NEW.suspension_reason := OLD.suspension_reason;
    NEW.moderation_notes := OLD.moderation_notes;
    NEW.balance := OLD.balance;
    NEW.total_earned := OLD.total_earned;
    NEW.email_verified := OLD.email_verified;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Add missing Admin Policies for various tables

-- Listings
DROP POLICY IF EXISTS "Admins can manage all listings" ON public.listings;
CREATE POLICY "Admins can manage all listings" 
  ON public.listings FOR ALL 
  USING (public.is_admin(auth.uid()));

-- Buyer Requests
DROP POLICY IF EXISTS "Admins can manage all buyer requests" ON public.buyer_requests;
CREATE POLICY "Admins can manage all buyer requests" 
  ON public.buyer_requests FOR ALL 
  USING (public.is_admin(auth.uid()));

-- Buyer Request Offers
DROP POLICY IF EXISTS "Admins can manage all buyer request offers" ON public.buyer_request_offers;
CREATE POLICY "Admins can manage all buyer request offers" 
  ON public.buyer_request_offers FOR ALL 
  USING (public.is_admin(auth.uid()));

-- Seller Reviews
DROP POLICY IF EXISTS "Admins can manage all seller reviews" ON public.seller_reviews;
CREATE POLICY "Admins can manage all seller reviews" 
  ON public.seller_reviews FOR ALL 
  USING (public.is_admin(auth.uid()));

-- Notifications
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.notifications;
CREATE POLICY "Admins can view all notifications" 
  ON public.notifications FOR SELECT 
  USING (public.is_admin(auth.uid()));

-- 6. Ensure is_admin function is robust (Re-asserting latest version)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id
    AND role = 'admin'
  ) OR EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = user_id
    AND email = 'skillerway100@gmail.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

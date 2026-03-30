-- Migration for Trust and Username Rules

-- 1. Add manual_trusted_override to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS manual_trusted_override BOOLEAN DEFAULT FALSE;

-- 2. Add username_updated_at to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS username_updated_at TIMESTAMP WITH TIME ZONE;

-- 3. Create function to protect profile fields
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER AS $$
BEGIN
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

-- 4. Create trigger to protect profile fields
DROP TRIGGER IF EXISTS on_profile_update_protect ON public.profiles;
CREATE TRIGGER on_profile_update_protect
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();

-- 5. Create function to recalculate is_trusted_seller when manual_trusted_override changes
CREATE OR REPLACE FUNCTION public.handle_profile_trust_update()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.manual_trusted_override IS DISTINCT FROM NEW.manual_trusted_override) THEN
    NEW.is_trusted_seller := (NEW.manual_trusted_override OR (NEW.review_count >= 10 AND NEW.average_rating >= 4.5));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create trigger to recalculate is_trusted_seller when manual_trusted_override changes
DROP TRIGGER IF EXISTS on_profile_trust_update ON public.profiles;
CREATE TRIGGER on_profile_trust_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_profile_trust_update();

-- 7. Create function to enforce 30-day username change limit
CREATE OR REPLACE FUNCTION public.enforce_username_update_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.username IS DISTINCT FROM NEW.username) THEN
    IF (OLD.username_updated_at IS NOT NULL AND OLD.username_updated_at > NOW() - INTERVAL '30 days') THEN
      RAISE EXCEPTION 'Username can only be changed once every 30 days.';
    END IF;
    NEW.username_updated_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create trigger to enforce 30-day username change limit
DROP TRIGGER IF EXISTS on_username_update_limit ON public.profiles;
CREATE TRIGGER on_username_update_limit
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_username_update_limit();

-- 9. Update calculate_seller_rating to use manual_trusted_override
CREATE OR REPLACE FUNCTION public.calculate_seller_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_seller_id UUID;
  avg_rating NUMERIC;
  cnt INTEGER;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    v_seller_id := OLD.seller_id;
  ELSE
    v_seller_id := NEW.seller_id;
  END IF;

  SELECT COALESCE(AVG(rating), 0), COUNT(*)
  INTO avg_rating, cnt
  FROM public.reviews
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

-- 10. Admin policy for manual_trusted_override
DROP POLICY IF EXISTS "Admins can update trusted override" ON profiles;
CREATE POLICY "Admins can update trusted override" ON profiles FOR UPDATE USING (
  is_admin(auth.uid())
);

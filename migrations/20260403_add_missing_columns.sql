-- Migration: Add Missing Columns to Orders and Listings
-- Date: 2026-04-03

-- 1. Add images to listings
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- 2. Add missing columns to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS request_id UUID REFERENCES public.buyer_requests(id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS offer_id UUID REFERENCES public.buyer_request_offers(id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total_price NUMERIC;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_provider TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS platform_fee NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS seller_payout NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS decline_reason TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS extra_time_requested_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS extra_time_reason TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS extra_time_hours INTEGER;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS extra_time_status TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE;

-- 3. Migrate data from amount to total_price if amount exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'amount') THEN
    UPDATE public.orders SET total_price = amount WHERE total_price IS NULL;
  END IF;
END $$;

-- 4. Set total_price to NOT NULL after migration
-- We only do this if all rows have total_price now
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.orders WHERE total_price IS NULL) THEN
    ALTER TABLE public.orders ALTER COLUMN total_price SET NOT NULL;
  END IF;
END $$;

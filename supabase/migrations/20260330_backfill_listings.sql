-- Backfill listings with NULL status to 'active'
UPDATE public.listings SET status = 'active' WHERE status IS NULL;

-- Ensure RLS is consistent (already updated in schema, but good to have here too)
DROP POLICY IF EXISTS "Listings are viewable by everyone" ON listings;
CREATE POLICY "Listings are viewable by everyone" ON listings FOR SELECT USING (status = 'active');

-- Add seller_notified_at to buyer_requests for idempotency
ALTER TABLE public.buyer_requests ADD COLUMN IF NOT EXISTS seller_notified_at TIMESTAMP WITH TIME ZONE;

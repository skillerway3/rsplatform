-- 1. Backfill listings status
UPDATE public.listings
SET status = 'active'
WHERE status IS NULL;

-- 2. Add notification_target_audience to buyer_requests
ALTER TABLE public.buyer_requests
ADD COLUMN IF NOT EXISTS notification_target_audience TEXT DEFAULT 'verified_sellers';

-- 3. Ensure seller_verifications table exists and has correct structure
-- (Already in schema.sql, but ensuring it's here for the migration report)
CREATE TABLE IF NOT EXISTS public.seller_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
    phone_number TEXT NOT NULL,
    document_type TEXT NOT NULL,
    id_front_url TEXT NOT NULL,
    id_back_url TEXT NOT NULL,
    selfie_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    admin_notes TEXT,
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Ensure notifications table can handle new types
-- (Already exists, but ensuring it's ready)

-- 5. RLS for notifications (Allow server-side inserts via service role, but client-side only for self)
-- This is already handled by the service role in the API routes.

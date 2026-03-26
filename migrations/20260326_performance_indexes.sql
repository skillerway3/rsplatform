-- Migration: Performance Optimization - Database Indexes
-- Date: 2026-03-26

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
-- Note: id is usually primary key and indexed by default, but adding for safety if not.

-- Listings
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON public.listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- Buyer Requests
CREATE INDEX IF NOT EXISTS idx_buyer_requests_buyer_id ON public.buyer_requests(buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_requests_status ON public.buyer_requests(status);

-- Buyer Request Offers
CREATE INDEX IF NOT EXISTS idx_buyer_request_offers_seller_id ON public.buyer_request_offers(seller_id);
CREATE INDEX IF NOT EXISTS idx_buyer_request_offers_request_id ON public.buyer_request_offers(request_id);

-- Support
CREATE INDEX IF NOT EXISTS idx_support_threads_user_id ON public.support_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_thread_id ON public.support_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON public.support_messages(created_at ASC);

-- Wallet
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON public.wallet_transactions(created_at DESC);

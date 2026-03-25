-- 1. Cleanup Profiles Table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS pending_balance;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_earned NUMERIC DEFAULT 0;

-- 2. Order Completion Trigger for Balance Updates
CREATE OR REPLACE FUNCTION public.handle_order_completion()
RETURNS TRIGGER AS $$
DECLARE
    v_seller_id UUID;
    v_payout NUMERIC;
BEGIN
    -- Only trigger when status changes to 'completed'
    IF (NEW.status = 'completed' AND OLD.status != 'completed') THEN
        v_seller_id := NEW.seller_id;
        v_payout := NEW.seller_payout;

        -- 1. Update seller's balance and total_earned
        UPDATE public.profiles
        SET 
            balance = COALESCE(balance, 0) + v_payout,
            total_earned = COALESCE(total_earned, 0) + v_payout
        WHERE id = v_seller_id;

        -- 2. Log the transaction in wallet_transactions
        INSERT INTO public.wallet_transactions (
            user_id,
            amount,
            type,
            status,
            description,
            reference_id,
            metadata
        ) VALUES (
            v_seller_id,
            v_payout,
            'sale_proceeds',
            'completed',
            'Sale proceeds for order #' || NEW.id,
            NEW.id,
            jsonb_build_object(
                'order_id', NEW.id,
                'total_price', NEW.total_price,
                'platform_fee', NEW.platform_fee
            )
        );

        -- 3. Log in transaction_logs for administrative audit
        INSERT INTO public.transaction_logs (
            order_id,
            order_code,
            user_id,
            actor_id,
            action_type,
            amount,
            platform_fee,
            seller_payout,
            metadata
        ) VALUES (
            NEW.id,
            NEW.order_code,
            v_seller_id,
            auth.uid(),
            'payout_released',
            NEW.total_price,
            NEW.platform_fee,
            v_payout,
            jsonb_build_object('trigger', 'order_completion')
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_order_completed_balance ON public.orders;
CREATE TRIGGER on_order_completed_balance
    AFTER UPDATE OF status ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_order_completion();

-- 3. Robust Admin Check (Re-asserting)
CREATE OR REPLACE FUNCTION is_admin(user_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Ensure RLS Policies use is_admin() consistently
-- Profiles
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (is_admin(auth.uid()));

-- Wallet Transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON public.wallet_transactions;
CREATE POLICY "Users can view own transactions" ON public.wallet_transactions FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all transactions" ON public.wallet_transactions;
CREATE POLICY "Admins can manage all transactions" ON public.wallet_transactions FOR ALL USING (is_admin(auth.uid()));

-- Orders
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
CREATE POLICY "Admins can manage all orders" ON public.orders FOR ALL USING (is_admin(auth.uid()));

-- 5. Fix for Next.js Config Conflict
-- We will ensure next.config.ts is the source of truth and next.config.js is deleted.

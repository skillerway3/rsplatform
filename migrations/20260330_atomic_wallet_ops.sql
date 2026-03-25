-- Atomic Wallet Operations Hardening

-- 1. Function to process a wallet deposit (Atomic)
CREATE OR REPLACE FUNCTION process_wallet_deposit(
    p_user_id UUID,
    p_amount NUMERIC,
    p_external_id TEXT,
    p_description TEXT,
    p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS VOID AS $$
BEGIN
    -- Check for duplicate external_id to prevent double-crediting
    IF p_external_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.wallet_transactions WHERE external_id = p_external_id
    ) THEN
        RAISE EXCEPTION 'Transaction with external_id % already exists', p_external_id;
    END IF;

    -- Update user balance
    UPDATE public.profiles
    SET balance = COALESCE(balance, 0) + p_amount,
        updated_at = NOW()
    WHERE id = p_user_id;

    -- Log the transaction
    INSERT INTO public.wallet_transactions (
        user_id,
        amount,
        type,
        status,
        external_id,
        description,
        metadata,
        created_at
    ) VALUES (
        p_user_id,
        p_amount,
        'deposit',
        'completed',
        p_external_id,
        p_description,
        p_metadata,
        NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Function to process a wallet withdrawal request (Atomic)
CREATE OR REPLACE FUNCTION process_wallet_withdrawal_request(
    p_user_id UUID,
    p_amount NUMERIC,
    p_description TEXT
) RETURNS VOID AS $$
DECLARE
    v_current_balance NUMERIC;
BEGIN
    -- Get and lock the profile row
    SELECT balance INTO v_current_balance
    FROM public.profiles
    WHERE id = p_user_id
    FOR UPDATE;

    IF v_current_balance IS NULL OR v_current_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient balance';
    END IF;

    -- Deduct balance
    UPDATE public.profiles
    SET balance = v_current_balance - p_amount,
        updated_at = NOW()
    WHERE id = p_user_id;

    -- Log the pending transaction
    INSERT INTO public.wallet_transactions (
        user_id,
        amount,
        type,
        status,
        description,
        created_at
    ) VALUES (
        p_user_id,
        p_amount,
        'withdrawal',
        'pending',
        p_description,
        NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Function to process admin withdrawal action (Atomic)
CREATE OR REPLACE FUNCTION process_wallet_withdrawal_admin_action(
    p_transaction_id UUID,
    p_admin_id UUID,
    p_action TEXT, -- 'approve' or 'reject'
    p_admin_notes TEXT
) RETURNS VOID AS $$
DECLARE
    v_user_id UUID;
    v_amount NUMERIC;
    v_status TEXT;
    v_type TEXT;
BEGIN
    -- Get and lock the transaction row
    SELECT user_id, amount, status, type INTO v_user_id, v_amount, v_status, v_type
    FROM public.wallet_transactions
    WHERE id = p_transaction_id
    FOR UPDATE;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Transaction not found';
    END IF;

    IF v_status != 'pending' OR v_type != 'withdrawal' THEN
        RAISE EXCEPTION 'Invalid transaction state for this action';
    END IF;

    IF p_action = 'approve' THEN
        -- Mark as completed
        UPDATE public.wallet_transactions
        SET status = 'completed',
            processed_at = NOW(),
            processed_by = p_admin_id,
            admin_notes = p_admin_notes
        WHERE id = p_transaction_id;

    ELSIF p_action = 'reject' THEN
        -- Mark as cancelled
        UPDATE public.wallet_transactions
        SET status = 'cancelled',
            processed_at = NOW(),
            processed_by = p_admin_id,
            admin_notes = p_admin_notes
        WHERE id = p_transaction_id;

        -- Refund user balance
        UPDATE public.profiles
        SET balance = COALESCE(balance, 0) + v_amount,
            updated_at = NOW()
        WHERE id = v_user_id;
    ELSE
        RAISE EXCEPTION 'Invalid action: %', p_action;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

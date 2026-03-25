-- Fix support_threads missing column
ALTER TABLE support_threads ADD COLUMN IF NOT EXISTS guest_session_id TEXT;

-- Atomic Wallet Operations
CREATE OR REPLACE FUNCTION atomic_wallet_deposit(
  p_user_id UUID,
  p_amount DECIMAL,
  p_type TEXT,
  p_description TEXT,
  p_reference_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS VOID AS $$
BEGIN
  -- Update balance
  UPDATE profiles 
  SET wallet_balance = wallet_balance + p_amount
  WHERE id = p_user_id;

  -- Insert transaction
  INSERT INTO wallet_transactions (
    user_id,
    amount,
    type,
    status,
    description,
    reference_id,
    metadata
  ) VALUES (
    p_user_id,
    p_amount,
    p_type,
    'completed',
    p_description,
    p_reference_id,
    p_metadata
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION atomic_wallet_withdrawal_request(
  p_user_id UUID,
  p_amount DECIMAL,
  p_method TEXT,
  p_details JSONB
) RETURNS VOID AS $$
DECLARE
  v_current_balance DECIMAL;
BEGIN
  -- Check balance
  SELECT wallet_balance INTO v_current_balance FROM profiles WHERE id = p_user_id FOR UPDATE;
  
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Deduct balance
  UPDATE profiles 
  SET wallet_balance = wallet_balance - p_amount
  WHERE id = p_user_id;

  -- Insert transaction (pending)
  INSERT INTO wallet_transactions (
    user_id,
    amount,
    type,
    status,
    description,
    metadata
  ) VALUES (
    p_user_id,
    -p_amount,
    'withdrawal',
    'pending',
    'Withdrawal request via ' || p_method,
    jsonb_build_object('withdrawal_method', p_method, 'withdrawal_details', p_details)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

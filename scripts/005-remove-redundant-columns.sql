-- Remove the 'code' column from 'reward_codes' if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reward_codes' AND column_name='code') THEN
        ALTER TABLE public.reward_codes DROP COLUMN code;
    END IF;
END
$$;

-- Remove the 'is_redeemed' column from 'reward_codes' if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reward_codes' AND column_name='is_redeemed') THEN
        ALTER TABLE public.reward_codes DROP COLUMN is_redeemed;
    END IF;
END
$$;

-- Remove the 'redeemed_at' column from 'reward_codes' if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reward_codes' AND column_name='redeemed_at') THEN
        ALTER TABLE public.reward_codes DROP COLUMN redeemed_at;
    END IF;
END
$$;

-- Add 'reward_id' to 'point_transactions' if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='point_transactions' AND column_name='reward_id') THEN
        ALTER TABLE public.point_transactions ADD COLUMN reward_id uuid REFERENCES public.reward_codes(id) ON DELETE SET NULL;
    END IF;
END
$$;

-- Update the 'deduct_points' function to use 'reward_id' in 'point_transactions'
CREATE OR REPLACE FUNCTION deduct_points(user_id_param uuid, points_to_deduct integer, description_param text, reward_id_param uuid DEFAULT NULL)
RETURNS TABLE(new_points integer, transaction_id uuid) AS $$
DECLARE
    current_points integer;
    v_transaction_id uuid;
BEGIN
    -- Get current points
    SELECT points INTO current_points FROM public.profiles WHERE id = user_id_param;

    -- Check if user has enough points
    IF current_points < points_to_deduct THEN
        RAISE EXCEPTION 'Punti insufficienti per riscattare questa ricompensa.';
    END IF;

    -- Deduct points from the user's profile
    UPDATE public.profiles
    SET points = points - points_to_deduct
    WHERE id = user_id_param;

    -- Record the transaction, linking to reward_id if provided
    INSERT INTO public.point_transactions (user_id, type, amount, description, reward_id)
    VALUES (user_id_param, 'redeem', points_to_deduct, description_param, reward_id_param)
    RETURNING id INTO v_transaction_id;

    -- Return the new points balance and transaction ID
    SELECT points INTO current_points FROM public.profiles WHERE id = user_id_param;
    RETURN QUERY SELECT current_points, v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute on updated deduct_points function
GRANT EXECUTE ON FUNCTION deduct_points(uuid, integer, text, uuid) TO authenticated;

-- Drop the old redeem_reward_transaction function if it exists
DROP FUNCTION IF EXISTS redeem_reward_transaction(uuid, uuid, integer);

-- Drop the old generate_reward_code function if it exists
DROP FUNCTION IF EXISTS generate_reward_code(integer);

-- Drop the old generate_unique_code function if it exists
DROP FUNCTION IF EXISTS generate_unique_code(integer);

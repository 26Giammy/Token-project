-- Add 'code' column back to 'reward_codes' if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reward_codes' AND column_name='code') THEN
        ALTER TABLE public.reward_codes ADD COLUMN code text UNIQUE;
    END IF;
END
$$;

-- Add 'is_redeemed' column back to 'reward_codes' if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reward_codes' AND column_name='is_redeemed') THEN
        ALTER TABLE public.reward_codes ADD COLUMN is_redeemed boolean DEFAULT FALSE NOT NULL;
    END IF;
END
$$;

-- Add 'redeemed_at' column back to 'reward_codes' if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reward_codes' AND column_name='redeemed_at') THEN
        ALTER TABLE public.reward_codes ADD COLUMN redeemed_at timestamp with time zone;
    END IF;
END
$$;

-- Drop the old 'reward_id' column from 'point_transactions' if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='point_transactions' AND column_name='reward_id') THEN
        ALTER TABLE public.point_transactions DROP COLUMN reward_id;
    END IF;
END
$$;

-- Function to generate a unique reward code
CREATE OR REPLACE FUNCTION generate_unique_code(length integer)
RETURNS text AS $$
DECLARE
    new_code text;
    code_exists boolean;
BEGIN
    LOOP
        new_code := substr(md5(random()::text), 1, length);
        SELECT EXISTS (SELECT 1 FROM public.reward_codes WHERE code = new_code) INTO code_exists;
        IF NOT code_exists THEN
            RETURN new_code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate and insert a reward code
CREATE OR REPLACE FUNCTION generate_reward_code(p_points_cost integer)
RETURNS text AS $$
DECLARE
    generated_code text;
BEGIN
    generated_code := generate_unique_code(8); -- Generate an 8-character code
    INSERT INTO public.reward_codes (code, points_cost)
    VALUES (generated_code, p_points_cost);
    RETURN generated_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set ownership for new functions
ALTER FUNCTION generate_unique_code(integer) OWNER TO postgres;
ALTER FUNCTION generate_reward_code(integer) OWNER TO postgres;

-- Grant usage on new functions to authenticated role
GRANT EXECUTE ON FUNCTION generate_unique_code(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_reward_code(integer) TO authenticated;

-- Function to redeem points and record transaction, linking to reward_codes
CREATE OR REPLACE FUNCTION redeem_user_points(p_user_id uuid, p_amount integer, p_description text)
RETURNS void AS $$
DECLARE
    current_points integer;
    v_transaction_id uuid;
BEGIN
    -- Get current points
    SELECT points INTO current_points FROM public.profiles WHERE id = p_user_id;

    -- Check if user has enough points
    IF current_points < p_amount THEN
        RAISE EXCEPTION 'Punti insufficienti per riscattare questa ricompensa.';
    END IF;

    -- Deduct points from the user's profile
    UPDATE public.profiles
    SET points = points - p_amount
    WHERE id = p_user_id;

    -- Record the transaction
    INSERT INTO public.point_transactions (user_id, type, amount, description)
    VALUES (p_user_id, 'redeem', p_amount, p_description)
    RETURNING id INTO v_transaction_id;

    -- Insert a record into reward_codes to track fulfillment
    INSERT INTO public.reward_codes (user_id, point_transaction_id, code, points_cost, is_redeemed)
    VALUES (p_user_id, v_transaction_id, 'PENDING', p_amount, FALSE); -- 'PENDING' code for admin fulfillment
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set ownership for new function
ALTER FUNCTION redeem_user_points(uuid, integer, text) OWNER TO postgres;

-- Grant usage on new function to authenticated role
GRANT EXECUTE ON FUNCTION redeem_user_points(uuid, integer, text) TO authenticated;

-- Add user_id and point_transaction_id to reward_codes table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reward_codes' AND column_name='user_id') THEN
        ALTER TABLE public.reward_codes ADD COLUMN user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reward_codes' AND column_name='point_transaction_id') THEN
        ALTER TABLE public.reward_codes ADD COLUMN point_transaction_id uuid REFERENCES public.point_transactions(id) ON DELETE SET NULL;
    END IF;
END
$$;

-- Update the deduct_points function to remove reward_id_param
CREATE OR REPLACE FUNCTION deduct_points(user_id_param uuid, points_to_deduct integer, description_param text)
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

    -- Record the transaction
    INSERT INTO public.point_transactions (user_id, type, amount, description)
    VALUES (user_id_param, 'redeem', points_to_deduct, description_param)
    RETURNING id INTO v_transaction_id;

    -- Return the new points balance and transaction ID
    SELECT points INTO current_points FROM public.profiles WHERE id = user_id_param;
    RETURN QUERY SELECT current_points, v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute on updated deduct_points function
GRANT EXECUTE ON FUNCTION deduct_points(uuid, integer, text) TO authenticated;

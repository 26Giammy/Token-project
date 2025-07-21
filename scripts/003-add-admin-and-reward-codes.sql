-- Add is_admin column to profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_admin') THEN
        ALTER TABLE public.profiles ADD COLUMN is_admin boolean DEFAULT FALSE NOT NULL;
    END IF;
END
$$;

-- Create reward_codes table
CREATE TABLE public.reward_codes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    code text UNIQUE NOT NULL,
    points_cost integer NOT NULL,
    is_redeemed boolean DEFAULT FALSE NOT NULL,
    redeemed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Set up Row Level Security (RLS) for reward_codes
ALTER TABLE public.reward_codes ENABLE ROW LEVEL SECURITY;

-- Policy for all authenticated users to view reward codes
CREATE POLICY "Authenticated users can view reward codes." ON public.reward_codes
FOR SELECT TO authenticated USING (TRUE);

-- Policy for admins to insert, update, delete reward codes
CREATE POLICY "Admins can manage reward codes." ON public.reward_codes
FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

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

-- Function to redeem a reward code and update user points in a transaction
CREATE OR REPLACE FUNCTION redeem_reward_transaction(p_user_id uuid, p_reward_code_id uuid, p_points_cost integer)
RETURNS void AS $$
DECLARE
    current_points integer;
BEGIN
    -- Check if user has enough points
    SELECT points INTO current_points FROM public.profiles WHERE id = p_user_id;

    IF current_points < p_points_cost THEN
        RAISE EXCEPTION 'Punti insufficienti per riscattare questo premio.';
    END IF;

    -- Deduct points from the user's profile
    UPDATE public.profiles
    SET points = points - p_points_cost
    WHERE id = p_user_id;

    -- Mark the reward code as redeemed
    UPDATE public.reward_codes
    SET is_redeemed = TRUE, redeemed_at = now()
    WHERE id = p_reward_code_id;

    -- Record the transaction
    INSERT INTO public.point_transactions (user_id, type, amount, description)
    VALUES (p_user_id, 'redeem', p_points_cost, 'Riscatto premio con codice');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set ownership for new function
ALTER FUNCTION redeem_reward_transaction(uuid, uuid, integer) OWNER TO postgres;

-- Grant usage on new function to authenticated role
GRANT EXECUTE ON FUNCTION redeem_reward_transaction(uuid, uuid, integer) TO authenticated;

-- Add a column to link reward_codes to point_transactions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reward_codes' AND column_name='point_transaction_id') THEN
        ALTER TABLE public.reward_codes ADD COLUMN point_transaction_id uuid REFERENCES public.point_transactions(id) ON DELETE SET NULL;
    END IF;
END
$$;

-- Update the deduct_points function to link to reward_codes
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

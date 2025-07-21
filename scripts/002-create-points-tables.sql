-- Create a table for user profiles
CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
    email text UNIQUE NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    is_admin boolean DEFAULT FALSE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to view and update their own profile
CREATE POLICY "Users can view and update their own profile." ON public.profiles
FOR ALL USING (auth.uid() = id);

-- Policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles." ON public.profiles
FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Create a table for point transactions
CREATE TABLE public.point_transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
    type text NOT NULL, -- 'add' or 'redeem'
    amount integer NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own transactions
CREATE POLICY "Users can view their own point transactions." ON public.point_transactions
FOR SELECT USING (auth.uid() = user_id);

-- Policy for admins to view all transactions
CREATE POLICY "Admins can view all point transactions." ON public.point_transactions
FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Policy for users to insert their own transactions (e.g., when points are redeemed)
CREATE POLICY "Users can insert their own point transactions." ON public.point_transactions
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for admins to insert any transaction (e.g., when adding points)
CREATE POLICY "Admins can insert any point transactions." ON public.point_transactions
FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Function to add points to a user and record the transaction
CREATE OR REPLACE FUNCTION add_points(user_id_param uuid, points_to_add integer, description_param text)
RETURNS void AS $$
BEGIN
    -- Add points to the user's profile
    UPDATE public.profiles
    SET points = points + points_to_add
    WHERE id = user_id_param;

    -- Record the transaction
    INSERT INTO public.point_transactions (user_id, type, amount, description)
    VALUES (user_id_param, 'add', points_to_add, description_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deduct points from a user and record the transaction
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

-- Set ownership for RLS to work correctly
ALTER FUNCTION add_points(uuid, integer, text) OWNER TO postgres;
ALTER FUNCTION deduct_points(uuid, integer, text) OWNER TO postgres;

-- Grant usage on functions to authenticated role
GRANT EXECUTE ON FUNCTION add_points(uuid, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION deduct_points(uuid, integer, text) TO authenticated;

-- Grant select, insert, update on profiles to authenticated role
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
-- Grant select, insert on point_transactions to authenticated role
GRANT SELECT, INSERT ON public.point_transactions TO authenticated;

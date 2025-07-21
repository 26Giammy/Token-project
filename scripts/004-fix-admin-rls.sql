-- Drop the problematic RLS policies first
DROP POLICY IF EXISTS "Allow authenticated users to view their own profile or admins to view all." ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to update their own profile or admins to update all." ON public.profiles;

-- Create a security definer function to check if the current user is an admin.
-- This function runs with the privileges of the user who created it (e.g., postgres),
-- thus bypassing RLS on the profiles table for this specific check.
CREATE OR REPLACE FUNCTION public.is_claims_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
  DECLARE
    _is_admin BOOLEAN;
  BEGIN
    SELECT is_admin INTO _is_admin FROM public.profiles WHERE id = auth.uid();
    RETURN _is_admin;
  END;
$$;

-- Re-add the RLS policies using the new is_claims_admin() function
CREATE POLICY "Enable read access for all users" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on user_id" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy for admins to update any profile
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Drop existing policies for point_transactions table
DROP POLICY IF EXISTS "Users can view their own point transactions." ON public.point_transactions;
DROP POLICY IF EXISTS "Admins can view all point transactions." ON public.point_transactions;
DROP POLICY IF EXISTS "Users can insert their own point transactions." ON public.point_transactions;
DROP POLICY IF EXISTS "Admins can insert any point transactions." ON public.point_transactions;

-- Recreate policies for point_transactions table with correct admin check
CREATE POLICY "Enable read access for all users" ON public.point_transactions
FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.point_transactions
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for admins to insert any transaction
CREATE POLICY "Admins can insert any point transactions." ON public.point_transactions
FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Drop existing policies for reward_codes table
DROP POLICY IF EXISTS "Authenticated users can view reward codes." ON public.reward_codes;
DROP POLICY IF EXISTS "Admins can manage reward codes." ON public.reward_codes;

-- Recreate policies for reward_codes table with correct admin check
CREATE POLICY "Enable read access for all users" ON public.reward_codes
FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.reward_codes
FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Enable update for admins only" ON public.reward_codes
FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Ensure the function owner is postgres (or a superuser) to make SECURITY DEFINER effective
-- This step might need to be run manually in Supabase SQL editor if you're not already a superuser.
-- ALTER FUNCTION public.is_claims_admin() OWNER TO postgres;

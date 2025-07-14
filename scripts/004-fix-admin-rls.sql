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
CREATE POLICY "Allow authenticated users to view their own profile or admins to view all." ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_claims_admin());

CREATE POLICY "Allow authenticated users to update their own profile or admins to update all." ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_claims_admin());

-- Ensure the function owner is postgres (or a superuser) to make SECURITY DEFINER effective
-- This step might need to be run manually in Supabase SQL editor if you're not already a superuser.
-- ALTER FUNCTION public.is_claims_admin() OWNER TO postgres;

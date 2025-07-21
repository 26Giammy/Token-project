-- Drop existing insert policy for profiles table
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;

-- Recreate insert policy for profiles table to allow users to insert their own profile
CREATE POLICY "Allow authenticated users to insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Ensure other policies are still in place or re-add if necessary
-- Policy for users to view their own profile
DROP POLICY IF EXISTS "Users can view and update their own profile." ON public.profiles;
CREATE POLICY "Users can view and update their own profile." ON public.profiles
FOR SELECT USING (auth.uid() = id);
FOR UPDATE USING (auth.uid() = id);

-- Policy for admins to view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles." ON public.profiles;
CREATE POLICY "Admins can view all profiles." ON public.profiles
FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Policy for admins to update any profile
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles
FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

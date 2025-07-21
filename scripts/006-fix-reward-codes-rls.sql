-- Drop existing policies for reward_codes table
DROP POLICY IF EXISTS "Enable read access for all users" ON public.reward_codes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.reward_codes;
DROP POLICY IF EXISTS "Enable update for admins only" ON public.reward_codes;

-- Recreate policies for reward_codes table
-- Allow all authenticated users to read reward codes
CREATE POLICY "Allow authenticated users to read reward_codes" ON public.reward_codes
FOR SELECT TO authenticated USING (true);

-- Allow admins to insert reward codes
CREATE POLICY "Allow admins to insert reward_codes" ON public.reward_codes
FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Allow admins to update reward codes (e.g., mark as fulfilled)
CREATE POLICY "Allow admins to update reward_codes" ON public.reward_codes
FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Allow admins to delete reward codes
CREATE POLICY "Allow admins to delete reward_codes" ON public.reward_codes
FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Drop the existing policy that only allows admins to create reward codes
DROP POLICY IF EXISTS "Admins can create reward codes." ON public.reward_codes;

-- Create a new policy that allows authenticated users to create reward codes
-- but only if the transaction_id they are linking to belongs to them.
CREATE POLICY "Allow authenticated users to create reward codes for their own transactions." ON public.reward_codes
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.point_transactions WHERE id = transaction_id AND user_id = auth.uid()));

-- Keep the SELECT and UPDATE policies for admins as they are correct for those operations
-- (assuming they were already set up to allow admins to view/update all)
-- If not, ensure you have policies like:
-- CREATE POLICY "Admins can view reward codes." ON public.reward_codes
--   FOR SELECT USING (public.is_claims_admin());
-- CREATE POLICY "Admins can update reward codes." ON public.reward_codes
--   FOR UPDATE USING (public.is_claims_admin());

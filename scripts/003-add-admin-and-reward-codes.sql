-- Add is_admin column to profiles table
ALTER TABLE public.profiles
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE NOT NULL;

-- Create the reward_codes table
CREATE TABLE IF NOT EXISTS public.reward_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES public.point_transactions(id) ON DELETE CASCADE UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add reward_code_id to point_transactions to link a redemption to a specific code
ALTER TABLE public.point_transactions
ADD COLUMN reward_code_id UUID REFERENCES public.reward_codes(id) ON DELETE SET NULL;

-- Update RLS policies for profiles table to allow admins to view/update all profiles
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;

CREATE POLICY "Allow authenticated users to view their own profile or admins to view all." ON public.profiles
  FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Allow authenticated users to create their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow authenticated users to update their own profile or admins to update all." ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Update RLS policies for point_transactions table to allow admins to view/create all transactions
DROP POLICY IF EXISTS "Users can view their own point transactions." ON public.point_transactions;
DROP POLICY IF EXISTS "Users can create their own point transactions." ON public.point_transactions;

CREATE POLICY "Allow authenticated users to view their own transactions or admins to view all." ON public.point_transactions
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Allow authenticated users to create their own transactions or admins to create all." ON public.point_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Policies for reward_codes table
ALTER TABLE public.reward_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view reward codes." ON public.reward_codes
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Admins can create reward codes." ON public.reward_codes
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Admins can update reward codes." ON public.reward_codes
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE));

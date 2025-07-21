-- Enable RLS on the profiles table if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop any existing insert policy to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON public.profiles;

-- Create a new RLS policy to allow authenticated users to insert their own profile
CREATE POLICY "Allow authenticated users to insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Enable RLS on the profiles table if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they conflict or are too restrictive for inserts
-- DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON profiles;
-- DROP POLICY IF EXISTS "Allow authenticated users to update their own profile" ON profiles;
-- DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON profiles;

-- Policy to allow authenticated users to insert their own profile
CREATE POLICY "Allow authenticated users to insert their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy to allow authenticated users to select their own profile
CREATE POLICY "Allow authenticated users to select their own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy to allow authenticated users to update their own profile
CREATE POLICY "Allow authenticated users to update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Policy to allow admins to manage all profiles (optional, but good for admin dashboard)
CREATE POLICY "Allow admins to manage all profiles"
ON profiles FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

ALTER TABLE public.profiles
ADD COLUMN name text;

-- Optional: If you want to backfill existing users with a name derived from their email
-- UPDATE public.profiles
-- SET name = split_part(email, '@', 1)
-- WHERE name IS NULL;

-- Optional: Add a policy to allow users to update their own name
CREATE POLICY "Users can update their own name"
ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

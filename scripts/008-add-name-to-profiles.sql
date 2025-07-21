-- Add 'name' column to profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='name') THEN
        ALTER TABLE public.profiles ADD COLUMN name text;
    END IF;
END
$$;

-- Update existing profiles to set name from email if name is null
UPDATE public.profiles
SET name = split_part(email, '@', 1)
WHERE name IS NULL;

-- Make the 'name' column NOT NULL after updating existing rows
ALTER TABLE public.profiles ALTER COLUMN name SET NOT NULL;

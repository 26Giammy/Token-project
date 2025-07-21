ALTER TABLE public.profiles
ADD COLUMN name TEXT;

-- Optional: Add a default value or constraint if needed
-- ALTER TABLE public.profiles ALTER COLUMN name SET DEFAULT 'User';
-- ALTER TABLE public.profiles ADD CONSTRAINT name_min_length CHECK (length(name) >= 2);

-- Optional: Update existing profiles with a default name if desired
-- UPDATE profiles
-- SET name = split_part(email, '@', 1)
-- WHERE name IS NULL;

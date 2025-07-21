ALTER TABLE public.profiles
ADD COLUMN name TEXT;

ALTER TABLE public.profiles
ALTER COLUMN name SET DEFAULT '';

-- Optional: Update existing profiles with a default name if desired
UPDATE public.profiles
SET name = split_part(email, '@', 1)
WHERE name IS NULL;

-- Optional: Update existing rows to have an empty string for name if null
UPDATE public.profiles
SET name = ''
WHERE name IS NULL;

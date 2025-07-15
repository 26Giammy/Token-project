-- Add a code column back to reward_codes table for actual reward codes
ALTER TABLE public.reward_codes
ADD COLUMN code TEXT UNIQUE;

-- Create a function to generate unique reward codes
CREATE OR REPLACE FUNCTION generate_reward_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code_length INTEGER := 8;
  characters TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
  char_index INTEGER;
BEGIN
  FOR i IN 1..code_length LOOP
    char_index := floor(random() * length(characters) + 1);
    result := result || substr(characters, char_index, 1);
  END LOOP;
  
  -- Check if code already exists, if so, generate a new one
  WHILE EXISTS (SELECT 1 FROM public.reward_codes WHERE code = result) LOOP
    result := '';
    FOR i IN 1..code_length LOOP
      char_index := floor(random() * length(characters) + 1);
      result := result || substr(characters, char_index, 1);
    END LOOP;
  END LOOP;
  
  RETURN result;
END;
$$;

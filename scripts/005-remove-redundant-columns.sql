-- Drop the foreign key constraint first if it exists
ALTER TABLE public.point_transactions
DROP CONSTRAINT IF EXISTS point_transactions_reward_code_id_fkey;

-- Drop the reward_code_id column from point_transactions
ALTER TABLE public.point_transactions
DROP COLUMN IF EXISTS reward_code_id;

-- Drop the 'code' column from reward_codes as it's no longer needed
ALTER TABLE public.reward_codes
DROP COLUMN IF EXISTS code;

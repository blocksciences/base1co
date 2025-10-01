
-- Ensure 'claimed' is a valid status for user_investments
-- First, let's check if there's a constraint and update it if needed
DO $$ 
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_investments_status_check'
  ) THEN
    ALTER TABLE user_investments DROP CONSTRAINT user_investments_status_check;
  END IF;
  
  -- Add new constraint with 'claimed' status
  ALTER TABLE user_investments 
  ADD CONSTRAINT user_investments_status_check 
  CHECK (status = ANY (ARRAY['active'::text, 'completed'::text, 'cancelled'::text, 'claimed'::text]));
END $$;

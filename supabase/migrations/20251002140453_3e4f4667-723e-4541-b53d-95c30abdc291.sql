-- Add contribution limits and cap information to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS min_contribution NUMERIC DEFAULT 0.01,
ADD COLUMN IF NOT EXISTS max_contribution NUMERIC DEFAULT 10,
ADD COLUMN IF NOT EXISTS soft_cap NUMERIC,
ADD COLUMN IF NOT EXISTS hard_cap NUMERIC;

-- Update existing projects to use goal_amount as hard_cap if not set
UPDATE projects
SET hard_cap = goal_amount
WHERE hard_cap IS NULL;

-- Set soft_cap to 50% of hard_cap for existing projects if not set
UPDATE projects
SET soft_cap = hard_cap * 0.5
WHERE soft_cap IS NULL;
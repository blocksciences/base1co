-- Add additional fields to project_applications table
ALTER TABLE public.project_applications
ADD COLUMN IF NOT EXISTS twitter TEXT,
ADD COLUMN IF NOT EXISTS telegram TEXT,
ADD COLUMN IF NOT EXISTS discord TEXT,
ADD COLUMN IF NOT EXISTS initial_price NUMERIC,
ADD COLUMN IF NOT EXISTS soft_cap NUMERIC,
ADD COLUMN IF NOT EXISTS hard_cap NUMERIC,
ADD COLUMN IF NOT EXISTS min_contribution NUMERIC,
ADD COLUMN IF NOT EXISTS max_contribution NUMERIC;
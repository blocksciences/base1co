-- Add comprehensive ICO project information fields to projects table

-- Company Information
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS company_legal_name TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS registration_number TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS registration_country TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS company_address TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS business_email TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS business_phone TEXT;

-- Project Details
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS problem_statement TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS solution TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS target_market TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS use_of_funds TEXT;

-- Team Information
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS founder_name TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS founder_role TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS founder_linkedin TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS founder_bio TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS team_size TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS advisors TEXT;

-- Social Links (expand existing)
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS whitepaper TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS twitter TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS telegram TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS discord TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS medium TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS github TEXT;

-- Tokenomics
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS total_supply NUMERIC;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS token_decimals INTEGER DEFAULT 18;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS token_price NUMERIC;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS public_sale_allocation NUMERIC;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS team_allocation NUMERIC;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS ecosystem_allocation NUMERIC;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS liquidity_allocation NUMERIC;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS seed_investors_allocation NUMERIC;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS vesting_schedule TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS allocation_image_url TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS vesting_schedule_image_url TEXT;

-- Legal & Compliance
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS jurisdiction_compliance TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS audit_report TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS kyc_provider TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS legal_opinion TEXT;

-- Token address
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS token_address TEXT;

-- Add comment
COMMENT ON TABLE public.projects IS 'Comprehensive ICO project information including company details, team, tokenomics, and legal compliance';
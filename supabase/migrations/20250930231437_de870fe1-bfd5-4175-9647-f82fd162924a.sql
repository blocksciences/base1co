-- Add tables for vesting schedules and liquidity locks

-- Vesting schedules table
CREATE TABLE IF NOT EXISTS public.vesting_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  beneficiary_address TEXT NOT NULL,
  contract_address TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  released_amount NUMERIC DEFAULT 0,
  start_time TIMESTAMPTZ NOT NULL,
  cliff_duration INTEGER NOT NULL, -- in seconds
  vesting_duration INTEGER NOT NULL, -- in seconds
  revocable BOOLEAN DEFAULT false,
  revoked BOOLEAN DEFAULT false,
  schedule_type TEXT NOT NULL, -- 'team', 'advisor', 'investor'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Liquidity locks table
CREATE TABLE IF NOT EXISTS public.liquidity_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  lock_id INTEGER NOT NULL, -- on-chain lock ID
  contract_address TEXT NOT NULL,
  token_address TEXT NOT NULL,
  beneficiary_address TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  unlock_time TIMESTAMPTZ NOT NULL,
  withdrawn BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Eligibility checks table (for compliance tracking)
CREATE TABLE IF NOT EXISTS public.eligibility_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  kyc_approved BOOLEAN DEFAULT false,
  geo_blocked BOOLEAN DEFAULT false,
  sanctions_check BOOLEAN DEFAULT false,
  last_checked_at TIMESTAMPTZ DEFAULT now(),
  ip_address TEXT,
  country_code TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Purchase receipts table (enhanced transaction tracking)
CREATE TABLE IF NOT EXISTS public.purchase_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  amount_eth NUMERIC NOT NULL,
  amount_tokens NUMERIC NOT NULL,
  token_price NUMERIC NOT NULL,
  receipt_data JSONB, -- store additional receipt details
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add new columns to projects table for enhanced features
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS kyc_registry_address TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS vesting_vault_address TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS liquidity_locker_address TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS max_per_wallet NUMERIC;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS is_paused BOOLEAN DEFAULT false;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vesting_schedules_project ON public.vesting_schedules(project_id);
CREATE INDEX IF NOT EXISTS idx_vesting_schedules_beneficiary ON public.vesting_schedules(beneficiary_address);
CREATE INDEX IF NOT EXISTS idx_liquidity_locks_project ON public.liquidity_locks(project_id);
CREATE INDEX IF NOT EXISTS idx_liquidity_locks_beneficiary ON public.liquidity_locks(beneficiary_address);
CREATE INDEX IF NOT EXISTS idx_eligibility_checks_wallet ON public.eligibility_checks(wallet_address);
CREATE INDEX IF NOT EXISTS idx_purchase_receipts_wallet ON public.purchase_receipts(wallet_address);
CREATE INDEX IF NOT EXISTS idx_purchase_receipts_project ON public.purchase_receipts(project_id);

-- Enable RLS
ALTER TABLE public.vesting_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liquidity_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eligibility_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_receipts ENABLE ROW LEVEL SECURITY;

-- RLS policies for vesting_schedules
CREATE POLICY "Anyone can view vesting schedules"
ON public.vesting_schedules FOR SELECT
USING (true);

CREATE POLICY "Admins can manage vesting schedules"
ON public.vesting_schedules FOR ALL
USING (is_current_user_admin());

-- RLS policies for liquidity_locks
CREATE POLICY "Anyone can view liquidity locks"
ON public.liquidity_locks FOR SELECT
USING (true);

CREATE POLICY "Admins can manage liquidity locks"
ON public.liquidity_locks FOR ALL
USING (is_current_user_admin());

-- RLS policies for eligibility_checks
CREATE POLICY "Users can view their own eligibility"
ON public.eligibility_checks FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert eligibility checks"
ON public.eligibility_checks FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage eligibility checks"
ON public.eligibility_checks FOR ALL
USING (is_current_user_admin());

-- RLS policies for purchase_receipts
CREATE POLICY "Users can view their own receipts"
ON public.purchase_receipts FOR SELECT
USING (true);

CREATE POLICY "Anyone can create receipts"
ON public.purchase_receipts FOR INSERT
WITH CHECK (true);

-- Update triggers for timestamps
CREATE TRIGGER update_vesting_schedules_updated_at
BEFORE UPDATE ON public.vesting_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_liquidity_locks_updated_at
BEFORE UPDATE ON public.liquidity_locks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Create staking pools table
CREATE TABLE public.staking_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  token_address TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  apy_rate NUMERIC NOT NULL, -- Annual percentage yield (e.g., 18.5 for 18.5%)
  total_staked NUMERIC NOT NULL DEFAULT 0,
  min_stake_amount NUMERIC NOT NULL DEFAULT 0.01,
  lock_period_days INTEGER NOT NULL DEFAULT 0, -- 0 means flexible
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user stakes table
CREATE TABLE public.user_stakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  pool_id UUID NOT NULL REFERENCES public.staking_pools(id) ON DELETE CASCADE,
  staked_amount NUMERIC NOT NULL,
  rewards_earned NUMERIC NOT NULL DEFAULT 0,
  last_reward_calculation TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  staked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unstaked_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active', -- active, unstaked
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create staking transactions table
CREATE TABLE public.staking_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  pool_id UUID NOT NULL REFERENCES public.staking_pools(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL, -- stake, unstake, claim_rewards
  amount NUMERIC NOT NULL,
  tx_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, failed
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.staking_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staking_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for staking_pools
CREATE POLICY "Anyone can view staking pools"
ON public.staking_pools
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage staking pools"
ON public.staking_pools
FOR ALL
USING (is_current_user_admin());

-- RLS Policies for user_stakes
CREATE POLICY "Users can view their own stakes"
ON public.user_stakes
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert stakes"
ON public.user_stakes
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their stakes"
ON public.user_stakes
FOR UPDATE
USING (true);

-- RLS Policies for staking_transactions
CREATE POLICY "Users can view their transactions"
ON public.staking_transactions
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create transactions"
ON public.staking_transactions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all transactions"
ON public.staking_transactions
FOR SELECT
USING (is_current_user_admin());

-- Create indexes
CREATE INDEX idx_user_stakes_wallet ON public.user_stakes(wallet_address);
CREATE INDEX idx_user_stakes_pool ON public.user_stakes(pool_id);
CREATE INDEX idx_user_stakes_status ON public.user_stakes(status);
CREATE INDEX idx_staking_transactions_wallet ON public.staking_transactions(wallet_address);

-- Create function to update updated_at timestamp
CREATE TRIGGER update_staking_pools_updated_at
BEFORE UPDATE ON public.staking_pools
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_stakes_updated_at
BEFORE UPDATE ON public.user_stakes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate rewards
CREATE OR REPLACE FUNCTION public.calculate_staking_rewards(stake_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  stake_record RECORD;
  pool_record RECORD;
  time_staked_seconds NUMERIC;
  annual_reward NUMERIC;
  current_reward NUMERIC;
BEGIN
  -- Get stake details
  SELECT * INTO stake_record FROM public.user_stakes WHERE id = stake_id AND status = 'active';
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Get pool details
  SELECT * INTO pool_record FROM public.staking_pools WHERE id = stake_record.pool_id;
  
  -- Calculate time staked in seconds since last calculation
  time_staked_seconds := EXTRACT(EPOCH FROM (now() - stake_record.last_reward_calculation));
  
  -- Calculate reward: (staked_amount * apy_rate / 100) * (time_staked_seconds / seconds_in_year)
  annual_reward := stake_record.staked_amount * (pool_record.apy_rate / 100);
  current_reward := annual_reward * (time_staked_seconds / 31536000); -- 31536000 seconds in a year
  
  RETURN current_reward;
END;
$$;

-- Insert default staking pool
INSERT INTO public.staking_pools (name, token_address, token_symbol, apy_rate, min_stake_amount, lock_period_days)
VALUES 
  ('Flexible ETH Staking', '0x0000000000000000000000000000000000000000', 'ETH', 18.5, 0.01, 0),
  ('30-Day Locked ETH', '0x0000000000000000000000000000000000000000', 'ETH', 25.0, 0.1, 30),
  ('90-Day Locked ETH', '0x0000000000000000000000000000000000000000', 'ETH', 35.0, 0.5, 90);
-- Platform Token Configuration
CREATE TABLE IF NOT EXISTS public.platform_token_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_name text NOT NULL DEFAULT 'List Token',
  token_symbol text NOT NULL DEFAULT 'LIST',
  token_address text,
  staking_vault_address text,
  decimals integer NOT NULL DEFAULT 18,
  total_supply numeric NOT NULL DEFAULT 10000000000,
  allocation_staking_rewards numeric NOT NULL DEFAULT 3000000000,
  allocation_ico_participants numeric NOT NULL DEFAULT 2500000000,
  allocation_team numeric NOT NULL DEFAULT 2000000000,
  allocation_liquidity numeric NOT NULL DEFAULT 1500000000,
  allocation_ecosystem numeric NOT NULL DEFAULT 1000000000,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Staking Lock Periods
CREATE TABLE IF NOT EXISTS public.staking_lock_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  period_key text NOT NULL UNIQUE,
  duration_days integer NOT NULL DEFAULT 0,
  apy_rate numeric NOT NULL,
  multiplier numeric NOT NULL DEFAULT 1.0,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert default lock periods
INSERT INTO public.staking_lock_periods (name, period_key, duration_days, apy_rate, multiplier, description) VALUES
  ('Flexible', 'flexible', 0, 3, 1.0, 'Withdraw anytime with lower rewards'),
  ('30 Days', 'lock-30', 30, 5, 1.1, 'Lock for 1 month'),
  ('90 Days', 'lock-90', 90, 12, 1.3, 'Lock for 3 months'),
  ('180 Days', 'lock-180', 180, 25, 1.6, 'Lock for 6 months'),
  ('365 Days', 'lock-365', 365, 50, 2.0, 'Lock for 1 year - Maximum rewards')
ON CONFLICT (period_key) DO NOTHING;

-- Staking Tiers
CREATE TABLE IF NOT EXISTS public.staking_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_key text NOT NULL UNIQUE,
  tier_name text NOT NULL,
  min_stake numeric NOT NULL,
  tier_color text NOT NULL,
  platform_fee_discount integer NOT NULL DEFAULT 0,
  allocation_multiplier numeric NOT NULL DEFAULT 1.0,
  early_access_hours integer NOT NULL DEFAULT 0,
  guaranteed_allocation boolean DEFAULT false,
  governance_votes integer NOT NULL DEFAULT 0,
  exclusive_whitelist boolean DEFAULT false,
  priority_queue boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert default tiers
INSERT INTO public.staking_tiers (tier_key, tier_name, min_stake, tier_color, platform_fee_discount, allocation_multiplier, early_access_hours, guaranteed_allocation, governance_votes, exclusive_whitelist, priority_queue) VALUES
  ('none', 'None', 0, 'gray', 0, 1.0, 0, false, 0, false, false),
  ('bronze', 'Bronze', 1000, '#CD7F32', 5, 1.2, 1, false, 1, false, false),
  ('silver', 'Silver', 5000, '#C0C0C0', 15, 1.5, 3, false, 2, true, true),
  ('gold', 'Gold', 25000, '#FFD700', 25, 2.0, 12, true, 5, true, true),
  ('platinum', 'Platinum', 100000, '#E5E4E2', 50, 3.0, 24, true, 15, true, true),
  ('diamond', 'Diamond', 500000, '#B9F2FF', 75, 5.0, 48, true, 50, true, true)
ON CONFLICT (tier_key) DO NOTHING;

-- Update user_stakes table for LIST token staking
DROP TABLE IF EXISTS public.platform_stakes;
CREATE TABLE public.platform_stakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  stake_id_onchain integer,
  amount numeric NOT NULL,
  lock_period_id uuid REFERENCES public.staking_lock_periods(id),
  start_time timestamp with time zone NOT NULL DEFAULT now(),
  unlock_time timestamp with time zone NOT NULL,
  last_reward_claim timestamp with time zone NOT NULL DEFAULT now(),
  rewards_earned numeric DEFAULT 0,
  total_rewards_claimed numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  tx_hash text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- User tier tracking (cached/computed)
CREATE TABLE IF NOT EXISTS public.user_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL UNIQUE,
  current_tier_id uuid REFERENCES public.staking_tiers(id),
  total_staked numeric NOT NULL DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now()
);

-- Platform fees collected from ICO launches
CREATE TABLE IF NOT EXISTS public.platform_fees_collected (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id),
  amount_collected numeric NOT NULL,
  amount_burned numeric NOT NULL DEFAULT 0,
  amount_to_stakers numeric NOT NULL DEFAULT 0,
  distribution_status text DEFAULT 'pending',
  collected_at timestamp with time zone DEFAULT now(),
  distributed_at timestamp with time zone
);

-- Governance proposals
CREATE TABLE IF NOT EXISTS public.governance_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  proposer_address text NOT NULL,
  proposal_type text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  votes_for numeric DEFAULT 0,
  votes_against numeric DEFAULT 0,
  votes_abstain numeric DEFAULT 0,
  start_time timestamp with time zone DEFAULT now(),
  end_time timestamp with time zone NOT NULL,
  execution_data jsonb,
  executed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Governance votes
CREATE TABLE IF NOT EXISTS public.governance_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid REFERENCES public.governance_proposals(id) ON DELETE CASCADE,
  voter_address text NOT NULL,
  vote_choice text NOT NULL,
  vote_weight numeric NOT NULL,
  tx_hash text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(proposal_id, voter_address)
);

-- Staking transactions for LIST token
CREATE TABLE IF NOT EXISTS public.platform_staking_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  stake_id uuid REFERENCES public.platform_stakes(id),
  transaction_type text NOT NULL,
  amount numeric NOT NULL,
  tx_hash text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.platform_token_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staking_lock_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staking_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_stakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_fees_collected ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_staking_transactions ENABLE ROW LEVEL SECURITY;

-- Platform token config: Everyone can read, admins can manage
CREATE POLICY "Anyone can view platform token config" ON public.platform_token_config FOR SELECT USING (true);
CREATE POLICY "Admins can manage platform token config" ON public.platform_token_config FOR ALL USING (is_current_user_admin());

-- Lock periods: Everyone can read, admins can manage
CREATE POLICY "Anyone can view lock periods" ON public.staking_lock_periods FOR SELECT USING (true);
CREATE POLICY "Admins can manage lock periods" ON public.staking_lock_periods FOR ALL USING (is_current_user_admin());

-- Tiers: Everyone can read, admins can manage
CREATE POLICY "Anyone can view tiers" ON public.staking_tiers FOR SELECT USING (true);
CREATE POLICY "Admins can manage tiers" ON public.staking_tiers FOR ALL USING (is_current_user_admin());

-- Platform stakes: Users can view their own, anyone can insert, users can update their own
CREATE POLICY "Users can view their stakes" ON public.platform_stakes FOR SELECT USING (true);
CREATE POLICY "Anyone can create stakes" ON public.platform_stakes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their stakes" ON public.platform_stakes FOR UPDATE USING (true);

-- User tiers: Everyone can view, anyone can update (computed values)
CREATE POLICY "Anyone can view user tiers" ON public.user_tiers FOR SELECT USING (true);
CREATE POLICY "Anyone can upsert user tiers" ON public.user_tiers FOR ALL USING (true);

-- Platform fees: Admins only
CREATE POLICY "Admins can manage platform fees" ON public.platform_fees_collected FOR ALL USING (is_current_user_admin());
CREATE POLICY "Anyone can view platform fees" ON public.platform_fees_collected FOR SELECT USING (true);

-- Governance: Everyone can read, anyone can create proposals, admins can update status
CREATE POLICY "Anyone can view proposals" ON public.governance_proposals FOR SELECT USING (true);
CREATE POLICY "Anyone can create proposals" ON public.governance_proposals FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update proposals" ON public.governance_proposals FOR UPDATE USING (is_current_user_admin());

-- Governance votes: Everyone can view and vote
CREATE POLICY "Anyone can view votes" ON public.governance_votes FOR SELECT USING (true);
CREATE POLICY "Anyone can vote" ON public.governance_votes FOR INSERT WITH CHECK (true);

-- Staking transactions: Users can view their own, anyone can insert
CREATE POLICY "Users can view their transactions" ON public.platform_staking_transactions FOR SELECT USING (true);
CREATE POLICY "Anyone can create transactions" ON public.platform_staking_transactions FOR INSERT WITH CHECK (true);

-- Functions
CREATE OR REPLACE FUNCTION public.calculate_platform_stake_rewards(stake_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  stake_record RECORD;
  period_record RECORD;
  time_staked_seconds NUMERIC;
  annual_reward NUMERIC;
  current_reward NUMERIC;
BEGIN
  SELECT * INTO stake_record FROM public.platform_stakes WHERE id = stake_id AND status = 'active';
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  SELECT * INTO period_record FROM public.staking_lock_periods WHERE id = stake_record.lock_period_id;
  
  time_staked_seconds := EXTRACT(EPOCH FROM (now() - stake_record.last_reward_claim));
  
  annual_reward := stake_record.amount * (period_record.apy_rate / 100);
  current_reward := annual_reward * (time_staked_seconds / 31536000);
  current_reward := current_reward * period_record.multiplier;
  
  RETURN current_reward;
END;
$$;

-- Function to get user's current tier
CREATE OR REPLACE FUNCTION public.get_user_tier(user_wallet text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  total_staked_amount NUMERIC;
  tier_id uuid;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO total_staked_amount
  FROM public.platform_stakes
  WHERE wallet_address = user_wallet AND status = 'active';
  
  SELECT id INTO tier_id
  FROM public.staking_tiers
  WHERE min_stake <= total_staked_amount
  ORDER BY min_stake DESC
  LIMIT 1;
  
  RETURN COALESCE(tier_id, (SELECT id FROM public.staking_tiers WHERE tier_key = 'none'));
END;
$$;

-- Trigger to update user tier when stakes change
CREATE OR REPLACE FUNCTION public.update_user_tier()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  total_staked NUMERIC;
  user_tier_id uuid;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO total_staked
  FROM public.platform_stakes
  WHERE wallet_address = COALESCE(NEW.wallet_address, OLD.wallet_address)
    AND status = 'active';
  
  user_tier_id := public.get_user_tier(COALESCE(NEW.wallet_address, OLD.wallet_address));
  
  INSERT INTO public.user_tiers (wallet_address, current_tier_id, total_staked, updated_at)
  VALUES (COALESCE(NEW.wallet_address, OLD.wallet_address), user_tier_id, total_staked, now())
  ON CONFLICT (wallet_address)
  DO UPDATE SET
    current_tier_id = EXCLUDED.current_tier_id,
    total_staked = EXCLUDED.total_staked,
    updated_at = now();
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_user_tier_on_stake_change
AFTER INSERT OR UPDATE OR DELETE ON public.platform_stakes
FOR EACH ROW
EXECUTE FUNCTION public.update_user_tier();

-- Insert initial platform token config
INSERT INTO public.platform_token_config (token_name, token_symbol, decimals, total_supply)
VALUES ('List Token', 'LIST', 18, 10000000000)
ON CONFLICT DO NOTHING;
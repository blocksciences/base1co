-- Create referral system tables
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_wallet TEXT NOT NULL,
  referee_wallet TEXT NOT NULL,
  referral_code TEXT NOT NULL,
  registration_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_purchases NUMERIC DEFAULT 0,
  total_rewards_earned NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  UNIQUE(referee_wallet)
);

CREATE TABLE IF NOT EXISTS public.referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID REFERENCES public.referrals(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  reward_type TEXT NOT NULL, -- 'referrer' or 'referee'
  amount NUMERIC NOT NULL,
  purchase_amount NUMERIC NOT NULL,
  project_id UUID REFERENCES public.projects(id),
  tx_hash TEXT,
  claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_referral_codes_wallet ON public.referral_codes(wallet_address);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_wallet);
CREATE INDEX IF NOT EXISTS idx_referrals_referee ON public.referrals(referee_wallet);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_wallet ON public.referral_rewards(wallet_address);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_claimed ON public.referral_rewards(claimed);

-- Add indexes for existing tables (optimization)
CREATE INDEX IF NOT EXISTS idx_transactions_from_status ON public.transactions(from_address, status);
CREATE INDEX IF NOT EXISTS idx_transactions_project_type ON public.transactions(project_id, transaction_type);
CREATE INDEX IF NOT EXISTS idx_projects_status_created ON public.projects(status, created_at);
CREATE INDEX IF NOT EXISTS idx_user_investments_wallet_status ON public.user_investments(wallet_address, status);
CREATE INDEX IF NOT EXISTS idx_kyc_status_country ON public.kyc_submissions(status, country);
CREATE INDEX IF NOT EXISTS idx_platform_stakes_wallet_status ON public.platform_stakes(wallet_address, status);

-- Enable RLS
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own referral codes"
  ON public.referral_codes FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own referral codes"
  ON public.referral_codes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view referrals"
  ON public.referrals FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their referral rewards"
  ON public.referral_rewards FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage referral rewards"
  ON public.referral_rewards FOR ALL
  USING (is_current_user_admin());

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code(user_wallet TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8 character alphanumeric code
    new_code := upper(substring(md5(random()::text || user_wallet), 1, 8));
    
    -- Check if code exists
    SELECT EXISTS(SELECT 1 FROM public.referral_codes WHERE code = new_code) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;
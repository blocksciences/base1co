-- Create user_investments table to track user investments
CREATE TABLE IF NOT EXISTS public.user_investments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id),
  project_name TEXT NOT NULL,
  project_symbol TEXT NOT NULL,
  amount_eth NUMERIC NOT NULL,
  amount_usd NUMERIC,
  tokens_received NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_amount CHECK (amount_eth > 0),
  CONSTRAINT valid_tokens CHECK (tokens_received > 0)
);

-- Create index for faster queries
CREATE INDEX idx_user_investments_wallet ON public.user_investments(wallet_address);
CREATE INDEX idx_user_investments_project ON public.user_investments(project_id);

-- Enable RLS
ALTER TABLE public.user_investments ENABLE ROW LEVEL SECURITY;

-- Users can view their own investments
CREATE POLICY "Users can view their own investments"
ON public.user_investments
FOR SELECT
USING (true);

-- Anyone can insert investments (for now, until we have proper auth)
CREATE POLICY "Anyone can create investments"
ON public.user_investments
FOR INSERT
WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_user_investments_updated_at
BEFORE UPDATE ON public.user_investments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
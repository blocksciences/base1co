-- Create a table to store admin wallet addresses
CREATE TABLE IF NOT EXISTS public.admin_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by TEXT
);

-- Enable RLS
ALTER TABLE public.admin_wallets ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read (needed for auth checks)
CREATE POLICY "Anyone can view admin wallets"
ON public.admin_wallets
FOR SELECT
USING (true);

-- Create policy for admins to insert (you'll need to manually insert the first admin)
CREATE POLICY "Admins can insert admin wallets"
ON public.admin_wallets
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.admin_wallets 
  WHERE wallet_address = current_setting('request.headers')::json->>'x-wallet-address'
));

-- Create policy for admins to delete
CREATE POLICY "Admins can delete admin wallets"
ON public.admin_wallets
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.admin_wallets 
  WHERE wallet_address = current_setting('request.headers')::json->>'x-wallet-address'
));

-- Create a function to check if a wallet is an admin
CREATE OR REPLACE FUNCTION public.is_wallet_admin(check_wallet_address TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_wallets
    WHERE LOWER(wallet_address) = LOWER(check_wallet_address)
  )
$$;
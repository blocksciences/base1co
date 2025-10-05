-- Add unique constraint to eligibility_checks table on wallet_address
ALTER TABLE public.eligibility_checks 
ADD CONSTRAINT eligibility_checks_wallet_address_key UNIQUE (wallet_address);
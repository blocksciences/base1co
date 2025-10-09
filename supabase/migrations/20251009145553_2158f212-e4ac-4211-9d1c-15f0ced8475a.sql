-- Clean up duplicate KYC submissions, keeping only the most recent approved one per wallet

WITH ranked_kyc AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY wallet_address, status 
           ORDER BY reviewed_at DESC NULLS LAST, created_at DESC
         ) as rn
  FROM public.kyc_submissions
)
DELETE FROM public.kyc_submissions
WHERE id IN (
  SELECT id FROM ranked_kyc WHERE rn > 1
);
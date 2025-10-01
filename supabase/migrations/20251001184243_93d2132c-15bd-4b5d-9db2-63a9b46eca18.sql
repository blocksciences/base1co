
-- Update the ICO Token project status to live
UPDATE public.projects 
SET status = 'live'
WHERE contract_address = '0x407dE769F995f02eD13C93e953A04AbF81D6ECc4';

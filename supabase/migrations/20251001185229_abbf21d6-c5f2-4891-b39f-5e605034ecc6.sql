
-- Add 'success' as a valid project status
ALTER TABLE public.projects 
DROP CONSTRAINT IF EXISTS projects_status_check;

ALTER TABLE public.projects 
ADD CONSTRAINT projects_status_check 
CHECK (status = ANY (ARRAY['pending'::text, 'live'::text, 'upcoming'::text, 'ended'::text, 'paused'::text, 'rejected'::text, 'success'::text]));

-- Now update the project status to success
UPDATE public.projects 
SET status = 'success'
WHERE id = '1d7726a3-568a-44c3-be1e-8c0b4bea29a3';

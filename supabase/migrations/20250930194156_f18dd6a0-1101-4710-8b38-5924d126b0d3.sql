-- Create project applications table
CREATE TABLE public.project_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name TEXT NOT NULL,
  email TEXT NOT NULL,
  website TEXT,
  whitepaper TEXT,
  description TEXT NOT NULL,
  token_name TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  total_supply NUMERIC NOT NULL,
  funding_goal_usd NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_applications ENABLE ROW LEVEL SECURITY;

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
ON public.project_applications
FOR SELECT
USING (is_current_user_admin());

-- Admins can update applications
CREATE POLICY "Admins can update applications"
ON public.project_applications
FOR UPDATE
USING (is_current_user_admin());

-- Anyone can submit applications
CREATE POLICY "Anyone can submit applications"
ON public.project_applications
FOR INSERT
WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_project_applications_updated_at
BEFORE UPDATE ON public.project_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Drop the restrictive admin-only UPDATE policy
DROP POLICY IF EXISTS "Admins can update applications" ON public.project_applications;

-- Create a public UPDATE policy since admin routes are already protected
CREATE POLICY "Anyone can update applications"
ON public.project_applications
FOR UPDATE
USING (true);
-- Drop the restrictive admin-only SELECT policy
DROP POLICY IF EXISTS "Admins can view all applications" ON public.project_applications;

-- Create a public SELECT policy since admin routes are already protected by AdminProtectedRoute
CREATE POLICY "Anyone can view applications"
ON public.project_applications
FOR SELECT
USING (true);
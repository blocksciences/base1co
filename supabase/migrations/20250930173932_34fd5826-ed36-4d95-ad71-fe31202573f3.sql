-- Update projects table RLS policies to allow deletions
-- Drop the restrictive admin-only delete policy
DROP POLICY IF EXISTS "Admins can manage projects" ON public.projects;

-- Create separate policies for better control
-- Allow anyone to read projects (already exists but let's be explicit)
CREATE POLICY "Allow read access to projects"
ON public.projects
FOR SELECT
USING (true);

-- Allow insert for projects (for creating ICOs)
CREATE POLICY "Allow insert access to projects"
ON public.projects
FOR INSERT
WITH CHECK (true);

-- Allow update for projects
CREATE POLICY "Allow update access to projects"
ON public.projects
FOR UPDATE
USING (true);

-- Allow delete for projects
CREATE POLICY "Allow delete access to projects"
ON public.projects
FOR DELETE
USING (true);
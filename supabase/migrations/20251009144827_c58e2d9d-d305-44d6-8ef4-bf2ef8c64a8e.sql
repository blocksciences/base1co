-- Fix RLS policies on eligibility_checks table to allow KYC approval operations

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can insert eligibility checks" ON public.eligibility_checks;
DROP POLICY IF EXISTS "Users can view their own eligibility" ON public.eligibility_checks;
DROP POLICY IF EXISTS "Admins can manage eligibility checks" ON public.eligibility_checks;

-- Create new policies that allow proper operations

-- Allow anyone (including admins) to insert/upsert eligibility checks
CREATE POLICY "Allow insert eligibility checks"
ON public.eligibility_checks
FOR INSERT
TO public
WITH CHECK (true);

-- Allow anyone (including admins) to update eligibility checks
CREATE POLICY "Allow update eligibility checks"
ON public.eligibility_checks
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Allow anyone to view eligibility checks
CREATE POLICY "Allow select eligibility checks"
ON public.eligibility_checks
FOR SELECT
TO public
USING (true);

-- Allow admins to delete if needed
CREATE POLICY "Admins can delete eligibility checks"
ON public.eligibility_checks
FOR DELETE
TO public
USING (is_current_user_admin());
-- Fix 1: Prevent privilege escalation on user_roles
-- Add explicit INSERT policy that only admins can insert roles
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Also add explicit DELETE restriction
CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Tighten case_documents INSERT policy
-- Drop the old loose policy
DROP POLICY IF EXISTS "Case participants can upload documents" ON public.case_documents;

-- Create new policy that verifies case participation
CREATE POLICY "Case participants can upload documents"
ON public.case_documents
FOR INSERT
TO authenticated
WITH CHECK (
  uploaded_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM cases
    WHERE cases.id = case_documents.case_id
    AND (cases.client_id = auth.uid() OR cases.lawyer_id = auth.uid())
  )
);

-- 1. Fix case_matches INSERT: restrict to case owner or admin
DROP POLICY IF EXISTS "Authenticated can insert matches" ON public.case_matches;
CREATE POLICY "Case owners or admins can insert matches"
ON public.case_matches FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = case_matches.case_id
      AND cases.client_id = auth.uid()
  )
);

-- 2. Add DELETE policy for lawyer-documents storage bucket
CREATE POLICY "Lawyers can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'lawyer-documents'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR auth.uid()::text = (storage.foldername(name))[1]
  )
);

-- 3. Add UPDATE policy for lawyer-documents storage bucket
CREATE POLICY "Lawyers can update own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'lawyer-documents'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR auth.uid()::text = (storage.foldername(name))[1]
  )
);


-- 1. Fix case_messages INSERT: require case participation
DROP POLICY IF EXISTS "Case participants can send messages" ON public.case_messages;
CREATE POLICY "Case participants can send messages"
ON public.case_messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM cases
    WHERE cases.id = case_messages.case_id
      AND (cases.client_id = auth.uid() OR cases.lawyer_id = auth.uid())
  )
);

-- 2. Fix lawyer_reviews INSERT: require completed case or consultation
DROP POLICY IF EXISTS "Clients can create reviews" ON public.lawyer_reviews;
CREATE POLICY "Clients can create reviews"
ON public.lawyer_reviews FOR INSERT
TO authenticated
WITH CHECK (
  client_id = auth.uid()
  AND (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.client_id = auth.uid()
        AND cases.lawyer_id = lawyer_reviews.lawyer_id
        AND cases.status = 'closed'
    )
    OR EXISTS (
      SELECT 1 FROM consultations
      WHERE consultations.client_id = auth.uid()
        AND consultations.lawyer_id = lawyer_reviews.lawyer_id
        AND consultations.status = 'completed'
    )
  )
);

-- 3. Fix lawyer_reviews SELECT: restrict to authenticated users only
DROP POLICY IF EXISTS "Anyone can read published reviews" ON public.lawyer_reviews;
CREATE POLICY "Anyone can read published reviews"
ON public.lawyer_reviews FOR SELECT
TO authenticated
USING ((is_flagged = false) OR (client_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

-- 4. Fix cases UPDATE: remove lawyer self-assignment to pending cases
DROP POLICY IF EXISTS "Lawyers can update assigned cases" ON public.cases;
CREATE POLICY "Lawyers can update assigned cases"
ON public.cases FOR UPDATE
TO authenticated
USING (lawyer_id = auth.uid());

-- 5. Fix cases SELECT for lawyers: remove pending case visibility
DROP POLICY IF EXISTS "Lawyers can view assigned and pending cases" ON public.cases;
CREATE POLICY "Lawyers can view assigned and pending cases"
ON public.cases FOR SELECT
TO authenticated
USING (lawyer_id = auth.uid());

-- 6. Fix profiles UPDATE: prevent user_type self-modification
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid() AND user_type = (SELECT user_type FROM public.profiles WHERE id = auth.uid()));

-- 7. Fix storage: case-documents SELECT - require case participation
DROP POLICY IF EXISTS "Case participants can view case docs" ON storage.objects;
CREATE POLICY "Case participants can view case docs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'case-documents'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.case_documents cd
      JOIN public.cases c ON c.id = cd.case_id
      WHERE cd.file_url LIKE '%' || storage.objects.name || '%'
        AND (c.client_id = auth.uid() OR c.lawyer_id = auth.uid())
    )
  )
);

-- 8. Fix storage: case-documents INSERT - require case participation
DROP POLICY IF EXISTS "Case participants can upload case docs" ON storage.objects;
CREATE POLICY "Case participants can upload case docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'case-documents'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.cases c
      WHERE (storage.foldername(name))[1] = c.id::text
        AND (c.client_id = auth.uid() OR c.lawyer_id = auth.uid())
    )
  )
);

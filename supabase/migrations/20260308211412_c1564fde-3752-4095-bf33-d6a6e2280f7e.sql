
-- Fix overly permissive INSERT policy on notifications
DROP POLICY "Authenticated users can create notifications" ON public.notifications;

CREATE POLICY "Users can create notifications for case participants" ON public.notifications
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND (
      user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.cases
        WHERE cases.id = notifications.related_case_id
        AND (cases.client_id = auth.uid() OR cases.lawyer_id = auth.uid())
      )
    )
  );

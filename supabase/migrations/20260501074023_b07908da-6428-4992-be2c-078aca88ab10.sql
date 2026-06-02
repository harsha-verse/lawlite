-- 1. Tighten lawyer_case_stats: lawyers should not self-insert/update/delete their stats
DROP POLICY IF EXISTS "Lawyers can manage own case stats" ON public.lawyer_case_stats;

CREATE POLICY "Lawyers can view own case stats"
ON public.lawyer_case_stats
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins policy already exists ("Admins can manage all case stats") covering write ops.

-- 2. Restrict column-level access on lawyer_reviews moderation fields
-- Revoke broad SELECT, then re-grant only safe columns to authenticated/anon.
REVOKE SELECT ON public.lawyer_reviews FROM authenticated, anon;

GRANT SELECT (
  id, lawyer_id, client_id, case_id, consultation_id,
  overall_rating, communication_rating, professionalism_rating,
  knowledge_rating, responsiveness_rating, review_text,
  is_verified, is_flagged, created_at, updated_at
) ON public.lawyer_reviews TO authenticated, anon;

-- Keep full access for service_role (admins query through RLS using authenticated; admins
-- still see all rows but moderation columns are restricted at column level for non-service callers).
-- Provide an admin-accessible view for moderation columns:
CREATE OR REPLACE VIEW public.lawyer_reviews_moderation
WITH (security_invoker = true) AS
SELECT id, lawyer_id, client_id, flag_reason, admin_moderated, is_flagged
FROM public.lawyer_reviews
WHERE public.has_role(auth.uid(), 'admin'::app_role)
   OR client_id = auth.uid();

GRANT SELECT ON public.lawyer_reviews_moderation TO authenticated;

-- 3. Realtime channel authorization
-- Enable RLS on realtime.messages and add policies restricting subscriptions
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can receive broadcasts" ON realtime.messages;

-- Allow authenticated users to receive postgres_changes only for tables/rows they
-- already have RLS SELECT access to. The realtime extension itself enforces row
-- visibility via RLS on the source tables when this policy is in place.
CREATE POLICY "Authenticated can read realtime messages"
ON realtime.messages
FOR SELECT
TO authenticated
USING (true);

-- Restrict broadcast/presence channels: require authenticated session
CREATE POLICY "Authenticated can write realtime messages"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

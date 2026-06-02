
-- Case matches table for tracking lawyer-case recommendations
CREATE TABLE public.case_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  lawyer_id uuid NOT NULL,
  match_score numeric NOT NULL DEFAULT 0,
  match_reasons text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'notified',
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.case_matches ENABLE ROW LEVEL SECURITY;

-- Lawyers can see matches assigned to them
CREATE POLICY "Lawyers can view own matches" ON public.case_matches
  FOR SELECT USING (lawyer_id = auth.uid());

-- Lawyers can update own matches (accept/decline)
CREATE POLICY "Lawyers can update own matches" ON public.case_matches
  FOR UPDATE USING (lawyer_id = auth.uid());

-- Clients can view matches for their cases
CREATE POLICY "Clients can view case matches" ON public.case_matches
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.cases WHERE cases.id = case_matches.case_id AND cases.client_id = auth.uid())
  );

-- System inserts via service role, but allow authenticated insert for edge function
CREATE POLICY "Authenticated can insert matches" ON public.case_matches
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Admin full access
CREATE POLICY "Admins can manage all matches" ON public.case_matches
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Add max_active_cases to lawyer_profiles
ALTER TABLE public.lawyer_profiles ADD COLUMN IF NOT EXISTS max_active_cases integer DEFAULT 10;

-- Add response_deadline and auto_assigned to cases
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS response_deadline timestamptz;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS auto_assigned boolean DEFAULT false;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS match_status text DEFAULT 'unmatched';

-- Enable realtime for case_matches
ALTER PUBLICATION supabase_realtime ADD TABLE public.case_matches;

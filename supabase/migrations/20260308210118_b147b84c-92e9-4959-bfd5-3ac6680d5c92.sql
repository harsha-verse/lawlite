
-- Add new columns to lawyer_profiles
ALTER TABLE public.lawyer_profiles
  ADD COLUMN IF NOT EXISTS tagline text,
  ADD COLUMN IF NOT EXISTS law_firm text,
  ADD COLUMN IF NOT EXISTS court_jurisdictions text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS languages_spoken text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS profile_visible boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS consultation_types text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS consultation_duration integer DEFAULT 30,
  ADD COLUMN IF NOT EXISTS available_days text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS available_start_time text DEFAULT '10:00',
  ADD COLUMN IF NOT EXISTS available_end_time text DEFAULT '18:00';

-- Lawyer education table
CREATE TABLE public.lawyer_education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  degree text NOT NULL,
  university text NOT NULL,
  graduation_year integer NOT NULL,
  certifications text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lawyer_education ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lawyers can manage own education" ON public.lawyer_education
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Anyone can read education of verified lawyers" ON public.lawyer_education
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.lawyer_profiles
      WHERE lawyer_profiles.user_id = lawyer_education.user_id
        AND lawyer_profiles.verification_status = 'verified'
    )
  );

CREATE POLICY "Admins can manage all education" ON public.lawyer_education
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Lawyer case stats table
CREATE TABLE public.lawyer_case_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  case_category text NOT NULL,
  cases_handled integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lawyer_case_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lawyers can manage own case stats" ON public.lawyer_case_stats
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Anyone can read case stats of verified lawyers" ON public.lawyer_case_stats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.lawyer_profiles
      WHERE lawyer_profiles.user_id = lawyer_case_stats.user_id
        AND lawyer_profiles.verification_status = 'verified'
    )
  );

CREATE POLICY "Admins can manage all case stats" ON public.lawyer_case_stats
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

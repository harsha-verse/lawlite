
-- Consultations table
CREATE TABLE public.consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE SET NULL,
  client_id uuid NOT NULL,
  lawyer_id uuid NOT NULL,
  consultation_type text NOT NULL DEFAULT 'online',
  scheduled_date date NOT NULL,
  scheduled_time text NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 30,
  status text NOT NULL DEFAULT 'pending',
  meeting_link text,
  lawyer_notes text,
  client_feedback text,
  client_rating integer,
  suggested_date date,
  suggested_time text,
  decline_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own consultations" ON public.consultations
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Clients can create consultations" ON public.consultations
  FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can update own consultations" ON public.consultations
  FOR UPDATE USING (client_id = auth.uid());

CREATE POLICY "Lawyers can view assigned consultations" ON public.consultations
  FOR SELECT USING (lawyer_id = auth.uid());

CREATE POLICY "Lawyers can update assigned consultations" ON public.consultations
  FOR UPDATE USING (lawyer_id = auth.uid());

CREATE POLICY "Admins can manage all consultations" ON public.consultations
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Add read_at to case_messages for read receipts
ALTER TABLE public.case_messages ADD COLUMN IF NOT EXISTS read_at timestamptz;

-- Add file attachment columns to case_messages
ALTER TABLE public.case_messages ADD COLUMN IF NOT EXISTS file_url text;
ALTER TABLE public.case_messages ADD COLUMN IF NOT EXISTS file_name text;
ALTER TABLE public.case_messages ADD COLUMN IF NOT EXISTS file_type text;

-- Enable realtime for consultations
ALTER PUBLICATION supabase_realtime ADD TABLE public.consultations;

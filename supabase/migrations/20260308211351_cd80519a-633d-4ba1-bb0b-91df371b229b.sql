
-- Cases table
CREATE TABLE public.cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  lawyer_id uuid,
  title text NOT NULL,
  case_type text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  priority text DEFAULT 'medium',
  client_location_city text,
  client_location_state text,
  preferred_consultation text DEFAULT 'online',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  closed_at timestamptz
);

ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- Client can see own cases
CREATE POLICY "Clients can view own cases" ON public.cases
  FOR SELECT USING (client_id = auth.uid());

-- Client can insert cases
CREATE POLICY "Clients can create cases" ON public.cases
  FOR INSERT WITH CHECK (client_id = auth.uid());

-- Client can update own pending cases
CREATE POLICY "Clients can update own cases" ON public.cases
  FOR UPDATE USING (client_id = auth.uid());

-- Lawyer can see assigned cases and pending requests
CREATE POLICY "Lawyers can view assigned and pending cases" ON public.cases
  FOR SELECT USING (lawyer_id = auth.uid() OR (status = 'pending' AND lawyer_id IS NULL));

-- Lawyer can update assigned cases
CREATE POLICY "Lawyers can update assigned cases" ON public.cases
  FOR UPDATE USING (lawyer_id = auth.uid() OR (status = 'pending' AND lawyer_id IS NULL));

-- Admin full access
CREATE POLICY "Admins can manage all cases" ON public.cases
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Case Notes table (private to lawyer)
CREATE TABLE public.case_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  lawyer_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.case_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lawyers can manage own case notes" ON public.case_notes
  FOR ALL USING (lawyer_id = auth.uid());

CREATE POLICY "Admins can view all case notes" ON public.case_notes
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Case Documents table
CREATE TABLE public.case_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.case_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Case participants can view documents" ON public.case_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = case_documents.case_id
      AND (cases.client_id = auth.uid() OR cases.lawyer_id = auth.uid())
    )
  );

CREATE POLICY "Case participants can upload documents" ON public.case_documents
  FOR INSERT WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Admins can manage all case documents" ON public.case_documents
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Case Messages table
CREATE TABLE public.case_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.case_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Case participants can view messages" ON public.case_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = case_messages.case_id
      AND (cases.client_id = auth.uid() OR cases.lawyer_id = auth.uid())
    )
  );

CREATE POLICY "Case participants can send messages" ON public.case_messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Admins can view all messages" ON public.case_messages
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  related_case_id uuid REFERENCES public.cases(id) ON DELETE SET NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- System can insert notifications (via service role or triggers)
CREATE POLICY "Authenticated users can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Enable realtime for messages and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.case_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Storage bucket for case documents
INSERT INTO storage.buckets (id, name, public) VALUES ('case-documents', 'case-documents', false);

CREATE POLICY "Case participants can upload case docs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'case-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Case participants can view case docs" ON storage.objects
  FOR SELECT USING (bucket_id = 'case-documents' AND auth.uid() IS NOT NULL);

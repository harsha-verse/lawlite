
-- 1. Extend app_role enum with 'junior'
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'junior';

-- 2. Extend cases with workspace fields
ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS court_name TEXT,
  ADD COLUMN IF NOT EXISTS case_number TEXT,
  ADD COLUMN IF NOT EXISTS case_stage TEXT DEFAULT 'filing',
  ADD COLUMN IF NOT EXISTS next_hearing_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS opponent_name TEXT,
  ADD COLUMN IF NOT EXISTS opponent_contact TEXT,
  ADD COLUMN IF NOT EXISTS workspace_client_id UUID;

-- 3. Lawyer's team members (juniors)
CREATE TABLE IF NOT EXISTS public.lawyer_team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lawyer_id UUID NOT NULL,
  member_user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'junior',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lawyer_id, member_user_id)
);
ALTER TABLE public.lawyer_team_members ENABLE ROW LEVEL SECURITY;

-- 4. Helper: is _user a junior team member of _lawyer?
CREATE OR REPLACE FUNCTION public.is_lawyer_team_member(_lawyer_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.lawyer_team_members
    WHERE lawyer_id = _lawyer_id AND member_user_id = _user_id
  )
$$;

-- Helper: list of lawyer_ids whose team _user belongs to
CREATE OR REPLACE FUNCTION public.team_lawyer_ids(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT lawyer_id FROM public.lawyer_team_members WHERE member_user_id = _user_id
$$;

CREATE POLICY "Lawyers manage own team" ON public.lawyer_team_members
  FOR ALL TO authenticated
  USING (lawyer_id = auth.uid())
  WITH CHECK (lawyer_id = auth.uid());

CREATE POLICY "Members view own membership" ON public.lawyer_team_members
  FOR SELECT TO authenticated
  USING (member_user_id = auth.uid());

CREATE POLICY "Admins manage all team" ON public.lawyer_team_members
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 5. Lawyer's private clients (CRM)
CREATE TABLE IF NOT EXISTS public.lawyer_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lawyer_id UUID NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  id_proof_url TEXT,
  notes TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  linked_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.lawyer_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lawyer manages own clients" ON public.lawyer_clients
  FOR ALL TO authenticated
  USING (lawyer_id = auth.uid())
  WITH CHECK (lawyer_id = auth.uid());

CREATE POLICY "Junior views team clients" ON public.lawyer_clients
  FOR SELECT TO authenticated
  USING (lawyer_id IN (SELECT public.team_lawyer_ids(auth.uid())));

CREATE POLICY "Admins manage all clients" ON public.lawyer_clients
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 6. Workspace tasks
CREATE TABLE IF NOT EXISTS public.workspace_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL,
  lawyer_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT NOT NULL DEFAULT 'medium',
  assignee_id UUID,
  deadline TIMESTAMP WITH TIME ZONE,
  checklist JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE public.workspace_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lawyer manages own case tasks" ON public.workspace_tasks
  FOR ALL TO authenticated
  USING (lawyer_id = auth.uid())
  WITH CHECK (lawyer_id = auth.uid());

CREATE POLICY "Junior manages team tasks" ON public.workspace_tasks
  FOR ALL TO authenticated
  USING (lawyer_id IN (SELECT public.team_lawyer_ids(auth.uid())))
  WITH CHECK (lawyer_id IN (SELECT public.team_lawyer_ids(auth.uid())));

CREATE POLICY "Admins manage all tasks" ON public.workspace_tasks
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 7. Workspace hearings
CREATE TABLE IF NOT EXISTS public.workspace_hearings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL,
  lawyer_id UUID NOT NULL,
  hearing_date DATE NOT NULL,
  hearing_time TEXT,
  court_name TEXT,
  court_room TEXT,
  judge_name TEXT,
  purpose TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  outcome TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.workspace_hearings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lawyer manages own hearings" ON public.workspace_hearings
  FOR ALL TO authenticated
  USING (lawyer_id = auth.uid())
  WITH CHECK (lawyer_id = auth.uid());

CREATE POLICY "Junior manages team hearings" ON public.workspace_hearings
  FOR ALL TO authenticated
  USING (lawyer_id IN (SELECT public.team_lawyer_ids(auth.uid())))
  WITH CHECK (lawyer_id IN (SELECT public.team_lawyer_ids(auth.uid())));

CREATE POLICY "Admins manage all hearings" ON public.workspace_hearings
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 8. Document versions (links to existing case_documents)
CREATE TABLE IF NOT EXISTS public.workspace_document_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL,
  lawyer_id UUID NOT NULL,
  document_id UUID,
  version_number INTEGER NOT NULL DEFAULT 1,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  tag TEXT,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.workspace_document_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lawyer manages own doc versions" ON public.workspace_document_versions
  FOR ALL TO authenticated
  USING (lawyer_id = auth.uid())
  WITH CHECK (lawyer_id = auth.uid() AND uploaded_by = auth.uid());

CREATE POLICY "Junior manages team doc versions" ON public.workspace_document_versions
  FOR ALL TO authenticated
  USING (lawyer_id IN (SELECT public.team_lawyer_ids(auth.uid())))
  WITH CHECK (lawyer_id IN (SELECT public.team_lawyer_ids(auth.uid())) AND uploaded_by = auth.uid());

CREATE POLICY "Admins manage all doc versions" ON public.workspace_document_versions
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 9. Audit log (append-only)
CREATE TABLE IF NOT EXISTS public.workspace_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lawyer_id UUID NOT NULL,
  actor_id UUID NOT NULL,
  case_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.workspace_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lawyer reads own audit log" ON public.workspace_audit_log
  FOR SELECT TO authenticated
  USING (lawyer_id = auth.uid());

CREATE POLICY "Junior reads team audit log" ON public.workspace_audit_log
  FOR SELECT TO authenticated
  USING (lawyer_id IN (SELECT public.team_lawyer_ids(auth.uid())));

CREATE POLICY "Admins read all audit log" ON public.workspace_audit_log
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Actor inserts audit entry" ON public.workspace_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid());

-- 10. Update timestamp triggers
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_lawyer_clients_updated BEFORE UPDATE ON public.lawyer_clients
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_workspace_tasks_updated BEFORE UPDATE ON public.workspace_tasks
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_workspace_hearings_updated BEFORE UPDATE ON public.workspace_hearings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 11. Indexes
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_case ON public.workspace_tasks(case_id);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_lawyer ON public.workspace_tasks(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_workspace_hearings_case ON public.workspace_hearings(case_id);
CREATE INDEX IF NOT EXISTS idx_workspace_hearings_lawyer_date ON public.workspace_hearings(lawyer_id, hearing_date);
CREATE INDEX IF NOT EXISTS idx_workspace_doc_versions_case ON public.workspace_document_versions(case_id);
CREATE INDEX IF NOT EXISTS idx_workspace_audit_lawyer_created ON public.workspace_audit_log(lawyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lawyer_clients_lawyer ON public.lawyer_clients(lawyer_id);

-- 12. Update existing cases UPDATE policy so juniors can update team cases too
CREATE POLICY "Junior updates team cases" ON public.cases
  FOR UPDATE TO authenticated
  USING (lawyer_id IN (SELECT public.team_lawyer_ids(auth.uid())));

CREATE POLICY "Junior views team cases" ON public.cases
  FOR SELECT TO authenticated
  USING (lawyer_id IN (SELECT public.team_lawyer_ids(auth.uid())));

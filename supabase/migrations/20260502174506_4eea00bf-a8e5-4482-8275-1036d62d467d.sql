CREATE TABLE public.chat_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_history_user_created ON public.chat_history(user_id, created_at);

ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat history"
ON public.chat_history FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own chat history"
ON public.chat_history FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own chat history"
ON public.chat_history FOR DELETE
TO authenticated
USING (user_id = auth.uid());
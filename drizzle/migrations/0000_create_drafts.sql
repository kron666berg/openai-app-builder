CREATE TABLE public.drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  mode text NOT NULL,
  input text NOT NULL,
  output text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.drafts TO authenticated;
GRANT ALL ON public.drafts TO service_role;
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own select" ON public.drafts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.drafts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own delete" ON public.drafts FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX drafts_user_created ON public.drafts (user_id, created_at DESC);
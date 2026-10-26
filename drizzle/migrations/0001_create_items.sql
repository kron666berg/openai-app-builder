CREATE TABLE public.items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  content text NOT NULL DEFAULT '' CHECK (char_length(content) <= 20000),
  url text CHECK (url IS NULL OR char_length(url) <= 2000),
  owner_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.items TO anon, authenticated;
GRANT ALL ON public.items TO service_role;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prototype open access" ON public.items FOR ALL TO anon, authenticated USING (owner_id IS NULL) WITH CHECK (owner_id IS NULL);
CREATE INDEX items_created ON public.items (created_at DESC);
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER items_touch BEFORE UPDATE ON public.items FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
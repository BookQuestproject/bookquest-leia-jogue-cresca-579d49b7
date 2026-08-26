-- Teacher allowlist
CREATE TABLE public.edu_teacher_allowlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.edu_teacher_allowlist TO authenticated;
GRANT ALL ON public.edu_teacher_allowlist TO service_role;
ALTER TABLE public.edu_teacher_allowlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage teacher allowlist" ON public.edu_teacher_allowlist
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can see their own allowlist entry" ON public.edu_teacher_allowlist
  FOR SELECT TO authenticated
  USING (lower(email) = lower(coalesce((auth.jwt() ->> 'email'), '')));

INSERT INTO public.edu_teacher_allowlist (email, note) VALUES
  ('bruno.silva@nacionalnet.com.br', 'Colégio Nacional'),
  ('oliveira.neto@nacionalnet.com.br', 'Colégio Nacional')
ON CONFLICT (email) DO NOTHING;

-- Auto-claim teacher access when the signed-in email is allowlisted
CREATE OR REPLACE FUNCTION public.claim_teacher_access()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  em text := lower(coalesce(auth.jwt() ->> 'email', ''));
BEGIN
  IF uid IS NULL OR em = '' THEN RETURN false; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.edu_teacher_allowlist WHERE lower(email) = em) THEN
    RETURN false;
  END IF;
  INSERT INTO public.edu_teachers (user_id, activation_code)
  VALUES (uid, 'ALLOWLIST')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN true;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.claim_teacher_access() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.claim_teacher_access() TO authenticated;

-- Feedback
CREATE TABLE public.feedback_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  audience text NOT NULL DEFAULT 'aluno',
  context text NOT NULL,
  rating smallint,
  comment text,
  page_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT feedback_rating_range CHECK (rating IS NULL OR (rating BETWEEN 1 AND 5)),
  CONSTRAINT feedback_comment_len CHECK (comment IS NULL OR char_length(comment) <= 1000)
);
CREATE INDEX idx_feedback_entries_context ON public.feedback_entries (context, created_at DESC);
GRANT SELECT, INSERT ON public.feedback_entries TO authenticated;
GRANT ALL ON public.feedback_entries TO service_role;
ALTER TABLE public.feedback_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users insert their own feedback" ON public.feedback_entries
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read their own feedback" ON public.feedback_entries
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read all feedback" ON public.feedback_entries
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
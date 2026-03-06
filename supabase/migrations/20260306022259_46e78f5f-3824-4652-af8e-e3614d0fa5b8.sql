
-- Academic diagnosis preferences
CREATE TABLE public.academic_diagnosis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  focus text NOT NULL, -- 'enem', 'vestibulares', 'ambos'
  target_exams text[] DEFAULT '{}', -- ['fuvest','unicamp','unesp','ufmg']
  weekly_hours integer NOT NULL DEFAULT 5,
  completed_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.academic_diagnosis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own diagnosis"
  ON public.academic_diagnosis FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diagnosis"
  ON public.academic_diagnosis FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diagnosis"
  ON public.academic_diagnosis FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_academic_diagnosis_updated_at
  BEFORE UPDATE ON public.academic_diagnosis
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

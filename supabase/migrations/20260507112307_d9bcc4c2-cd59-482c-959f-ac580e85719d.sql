
-- Tables first
CREATE TABLE public.edu_journeys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  title text NOT NULL,
  book_id text,
  book_title text,
  author text,
  total_pages integer,
  total_chapters integer NOT NULL DEFAULT 1,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.edu_journey_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id uuid NOT NULL REFERENCES public.edu_journeys(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (journey_id, class_id)
);

CREATE TABLE public.edu_journey_chapter_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id uuid NOT NULL REFERENCES public.edu_journeys(id) ON DELETE CASCADE,
  chapter_number integer NOT NULL,
  question_text text NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.edu_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_user_id uuid NOT NULL,
  teacher_id uuid NOT NULL,
  period_label text,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  analysis_text text,
  teacher_note text,
  status text NOT NULL DEFAULT 'gerado',
  sent_at timestamptz,
  pdf_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.edu_teacher_settings (
  teacher_id uuid PRIMARY KEY,
  school_name text,
  signature text,
  email_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  notification_prefs jsonb NOT NULL DEFAULT '{}'::jsonb,
  visual_prefs jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.edu_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edu_journey_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edu_journey_chapter_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edu_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edu_teacher_settings ENABLE ROW LEVEL SECURITY;

-- Policies: edu_journeys
CREATE POLICY "Teachers manage own journeys" ON public.edu_journeys FOR ALL TO authenticated
USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Members view assigned journeys" ON public.edu_journeys FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.edu_journey_classes jc
  JOIN public.class_members cm ON cm.class_id = jc.class_id
  WHERE jc.journey_id = edu_journeys.id AND cm.user_id = auth.uid()
));
CREATE POLICY "Admins manage journeys" ON public.edu_journeys FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Policies: edu_journey_classes
CREATE POLICY "Teachers manage own journey-classes" ON public.edu_journey_classes FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.edu_journeys j WHERE j.id = journey_id AND j.teacher_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.edu_journeys j WHERE j.id = journey_id AND j.teacher_id = auth.uid()));
CREATE POLICY "Members view journey-classes" ON public.edu_journey_classes FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.class_members cm WHERE cm.class_id = edu_journey_classes.class_id AND cm.user_id = auth.uid()));

-- Policies: edu_journey_chapter_questions
CREATE POLICY "Teachers manage own questions" ON public.edu_journey_chapter_questions FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.edu_journeys j WHERE j.id = journey_id AND j.teacher_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.edu_journeys j WHERE j.id = journey_id AND j.teacher_id = auth.uid()));
CREATE POLICY "Members view questions" ON public.edu_journey_chapter_questions FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.edu_journey_classes jc
  JOIN public.class_members cm ON cm.class_id = jc.class_id
  WHERE jc.journey_id = edu_journey_chapter_questions.journey_id AND cm.user_id = auth.uid()
));

-- Policies: edu_reports
CREATE POLICY "Teachers manage own reports" ON public.edu_reports FOR ALL TO authenticated
USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Students view own reports" ON public.edu_reports FOR SELECT TO authenticated
USING (auth.uid() = student_user_id);

-- Policies: edu_teacher_settings
CREATE POLICY "Teachers manage own settings" ON public.edu_teacher_settings FOR ALL TO authenticated
USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);

-- Triggers
CREATE TRIGGER trg_edu_journeys_updated BEFORE UPDATE ON public.edu_journeys FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_edu_jcq_updated BEFORE UPDATE ON public.edu_journey_chapter_questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_edu_reports_updated BEFORE UPDATE ON public.edu_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_edu_teacher_settings_updated BEFORE UPDATE ON public.edu_teacher_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RPCs
CREATE OR REPLACE FUNCTION public.teacher_add_student_to_class(_class_id uuid, _student_user_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE is_owner boolean;
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  SELECT EXISTS (SELECT 1 FROM public.classes WHERE id = _class_id AND teacher_id = auth.uid()) INTO is_owner;
  IF NOT is_owner THEN RETURN false; END IF;
  INSERT INTO public.class_members (class_id, user_id) VALUES (_class_id, _student_user_id) ON CONFLICT DO NOTHING;
  RETURN true;
END; $$;

CREATE OR REPLACE FUNCTION public.find_user_by_handle(_handle text)
RETURNS TABLE(id uuid, full_name text, username text, email text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.full_name, p.username, p.email
  FROM public.profiles p
  WHERE p.username = lower(regexp_replace(_handle, '^@', ''))
     OR p.email = lower(_handle)
  LIMIT 1;
$$;

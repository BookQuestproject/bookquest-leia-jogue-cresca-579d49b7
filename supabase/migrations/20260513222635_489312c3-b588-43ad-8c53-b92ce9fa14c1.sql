-- Activities table (leitura, avaliativa, desafio)
CREATE TABLE public.edu_class_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL,
  teacher_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('leitura','avaliativa','desafio')),
  title text NOT NULL,
  description text,
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.edu_class_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers manage own activities"
  ON public.edu_class_activities
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_id AND c.teacher_id = auth.uid())
  )
  WITH CHECK (
    auth.uid() = teacher_id AND
    EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_id AND c.teacher_id = auth.uid())
  );

CREATE POLICY "Members view activities"
  ON public.edu_class_activities
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.class_members m WHERE m.class_id = edu_class_activities.class_id AND m.user_id = auth.uid())
  );

CREATE INDEX idx_edu_class_activities_class ON public.edu_class_activities(class_id, due_date);

CREATE TRIGGER update_edu_class_activities_updated_at
  BEFORE UPDATE ON public.edu_class_activities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Extend chapter questions with options + reflection text
ALTER TABLE public.edu_journey_chapter_questions
  ADD COLUMN IF NOT EXISTS options jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS reflection_text text;
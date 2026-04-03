
-- Create edu_teachers table
CREATE TABLE IF NOT EXISTS public.edu_teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  activated_at timestamp with time zone NOT NULL DEFAULT now(),
  activation_code text NOT NULL
);

ALTER TABLE public.edu_teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view own record" ON public.edu_teachers
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can register as teacher" ON public.edu_teachers
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage teachers" ON public.edu_teachers
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Teacher policies on classes
CREATE POLICY "Teachers can view own classes" ON public.classes
  FOR SELECT TO authenticated USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create classes" ON public.classes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = teacher_id AND EXISTS (SELECT 1 FROM edu_teachers WHERE user_id = auth.uid()));

CREATE POLICY "Teachers can update own classes" ON public.classes
  FOR UPDATE TO authenticated USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete own classes" ON public.classes
  FOR DELETE TO authenticated USING (auth.uid() = teacher_id);

-- Teacher policies on related tables
CREATE POLICY "Teachers can view class progress" ON public.class_reading_progress
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM classes WHERE classes.id = class_reading_progress.class_id AND classes.teacher_id = auth.uid()));

CREATE POLICY "Teachers can create questions" ON public.class_questions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by AND EXISTS (SELECT 1 FROM classes WHERE classes.id = class_questions.class_id AND classes.teacher_id = auth.uid()));

CREATE POLICY "Teachers can view class questions" ON public.class_questions
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM classes WHERE classes.id = class_questions.class_id AND classes.teacher_id = auth.uid()));

CREATE POLICY "Teachers can view class responses" ON public.class_question_responses
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM class_questions q JOIN classes c ON c.id = q.class_id WHERE q.id = class_question_responses.question_id AND c.teacher_id = auth.uid()));

CREATE POLICY "Teachers can view class discussions" ON public.class_chapter_discussions
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM classes WHERE classes.id = class_chapter_discussions.class_id AND classes.teacher_id = auth.uid()));

CREATE POLICY "Teachers can create discussions" ON public.class_chapter_discussions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM classes WHERE classes.id = class_chapter_discussions.class_id AND classes.teacher_id = auth.uid()));

CREATE POLICY "Teachers can view class members" ON public.class_members
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM classes WHERE classes.id = class_members.class_id AND classes.teacher_id = auth.uid()));

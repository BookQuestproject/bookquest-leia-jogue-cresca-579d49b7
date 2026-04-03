
-- Class challenges (weekly/custom)
CREATE TABLE public.edu_class_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  challenge_type text NOT NULL DEFAULT 'weekly',
  goal_value integer NOT NULL DEFAULT 1,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date NOT NULL DEFAULT (CURRENT_DATE + interval '7 days')::date,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.edu_class_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage challenges" ON public.edu_class_challenges
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM classes WHERE classes.id = edu_class_challenges.class_id AND classes.teacher_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM classes WHERE classes.id = edu_class_challenges.class_id AND classes.teacher_id = auth.uid()));

CREATE POLICY "Members can view challenges" ON public.edu_class_challenges
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM class_members WHERE class_members.class_id = edu_class_challenges.class_id AND class_members.user_id = auth.uid()));

-- Student achievements
CREATE TABLE public.edu_student_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  achievement_type text NOT NULL,
  achievement_label text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  awarded_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(class_id, user_id, achievement_type)
);

ALTER TABLE public.edu_student_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view achievements" ON public.edu_student_achievements
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM class_members WHERE class_members.class_id = edu_student_achievements.class_id AND class_members.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM classes WHERE classes.id = edu_student_achievements.class_id AND classes.teacher_id = auth.uid())
  );

CREATE POLICY "Members can earn achievements" ON public.edu_student_achievements
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM class_members WHERE class_members.class_id = edu_student_achievements.class_id AND class_members.user_id = auth.uid()));

-- Class announcements from teacher
CREATE TABLE public.edu_class_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.edu_class_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage announcements" ON public.edu_class_announcements
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM classes WHERE classes.id = edu_class_announcements.class_id AND classes.teacher_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM classes WHERE classes.id = edu_class_announcements.class_id AND classes.teacher_id = auth.uid()));

CREATE POLICY "Members can view announcements" ON public.edu_class_announcements
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM class_members WHERE class_members.class_id = edu_class_announcements.class_id AND class_members.user_id = auth.uid()));

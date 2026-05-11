-- Helper function to check journey ownership without recursion
CREATE OR REPLACE FUNCTION public.is_journey_teacher(_journey_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.edu_journeys
    WHERE id = _journey_id AND teacher_id = _user_id
  );
$$;

-- Helper to check if user is member of any class linked to a journey
CREATE OR REPLACE FUNCTION public.is_journey_member(_journey_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.edu_journey_classes jc
    JOIN public.class_members cm ON cm.class_id = jc.class_id
    WHERE jc.journey_id = _journey_id
      AND cm.user_id = _user_id
  );
$$;

-- Replace recursive policies on edu_journey_classes
DROP POLICY IF EXISTS "Teachers manage own journey-classes" ON public.edu_journey_classes;
DROP POLICY IF EXISTS "Members view journey-classes" ON public.edu_journey_classes;

CREATE POLICY "Teachers manage own journey-classes"
ON public.edu_journey_classes
FOR ALL TO authenticated
USING (public.is_journey_teacher(journey_id, auth.uid()))
WITH CHECK (public.is_journey_teacher(journey_id, auth.uid()));

CREATE POLICY "Members view journey-classes"
ON public.edu_journey_classes
FOR SELECT TO authenticated
USING (public.is_class_member(class_id, auth.uid()));

-- Replace recursive policies on edu_journey_chapter_questions
DROP POLICY IF EXISTS "Teachers manage own questions" ON public.edu_journey_chapter_questions;
DROP POLICY IF EXISTS "Members view questions" ON public.edu_journey_chapter_questions;

CREATE POLICY "Teachers manage own questions"
ON public.edu_journey_chapter_questions
FOR ALL TO authenticated
USING (public.is_journey_teacher(journey_id, auth.uid()))
WITH CHECK (public.is_journey_teacher(journey_id, auth.uid()));

CREATE POLICY "Members view questions"
ON public.edu_journey_chapter_questions
FOR SELECT TO authenticated
USING (public.is_journey_member(journey_id, auth.uid()));

-- Replace member-view policy on edu_journeys (the recursion source)
DROP POLICY IF EXISTS "Members view assigned journeys" ON public.edu_journeys;

CREATE POLICY "Members view assigned journeys"
ON public.edu_journeys
FOR SELECT TO authenticated
USING (public.is_journey_member(id, auth.uid()));

-- Fix infinite recursion between classes <-> class_members policies
-- by routing the cross-table checks through SECURITY DEFINER helpers.

CREATE OR REPLACE FUNCTION public.is_class_teacher(_class_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.classes
    WHERE id = _class_id AND teacher_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_class_member(_class_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.class_members
    WHERE class_id = _class_id AND user_id = _user_id
  );
$$;

-- Replace recursive policies on classes
DROP POLICY IF EXISTS "Members can view their class" ON public.classes;
CREATE POLICY "Members can view their class"
ON public.classes FOR SELECT TO authenticated
USING (public.is_class_member(id, auth.uid()));

-- Replace recursive policies on class_members
DROP POLICY IF EXISTS "Teachers can view class members" ON public.class_members;
CREATE POLICY "Teachers can view class members"
ON public.class_members FOR SELECT TO authenticated
USING (public.is_class_teacher(class_id, auth.uid()));

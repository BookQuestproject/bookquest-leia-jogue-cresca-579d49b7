CREATE OR REPLACE FUNCTION public.activate_teacher_with_code(_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  uid uuid := auth.uid();
  is_student boolean;
BEGIN
  IF uid IS NULL THEN
    RETURN false;
  END IF;

  IF upper(_code) <> 'BOOKQUEST2026' THEN
    RETURN false;
  END IF;

  -- Block users that are already enrolled as students in any class
  SELECT EXISTS (SELECT 1 FROM public.class_members WHERE user_id = uid) INTO is_student;
  IF is_student THEN
    RETURN false;
  END IF;

  INSERT INTO public.edu_teachers (user_id, activation_code)
  VALUES (uid, upper(_code))
  ON CONFLICT (user_id) DO NOTHING;

  RETURN true;
END;
$function$;
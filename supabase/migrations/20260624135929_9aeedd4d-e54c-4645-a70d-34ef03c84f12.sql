
-- 1) Drop redundant student_email column from class_members (email already on profiles)
ALTER TABLE public.class_members DROP COLUMN IF EXISTS student_email;

-- Update join function to no longer write student_email
CREATE OR REPLACE FUNCTION public.student_join_class_by_code(_code text, _email text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  uid uuid := auth.uid();
  cls_id uuid;
BEGIN
  IF uid IS NULL THEN RETURN NULL; END IF;

  SELECT id INTO cls_id
  FROM public.classes
  WHERE access_code = upper(_code) AND is_active = true
  LIMIT 1;

  IF cls_id IS NULL THEN RETURN NULL; END IF;

  INSERT INTO public.class_members (class_id, user_id, last_seen_at)
  VALUES (cls_id, uid, now())
  ON CONFLICT DO NOTHING;

  RETURN cls_id;
END;
$function$;

-- 2) Remove direct UPDATE policy on user_xp; provide SECURITY DEFINER RPCs instead
DROP POLICY IF EXISTS "Users can update own xp" ON public.user_xp;

CREATE OR REPLACE FUNCTION public.add_user_xp(_amount integer)
RETURNS TABLE(xp integer, week_xp integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF _amount IS NULL OR _amount <= 0 OR _amount > 1000 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  INSERT INTO public.user_xp (user_id, xp, week_xp)
  VALUES (uid, _amount, _amount)
  ON CONFLICT (user_id) DO UPDATE
    SET xp = public.user_xp.xp + EXCLUDED.xp,
        week_xp = COALESCE(public.user_xp.week_xp, 0) + EXCLUDED.week_xp,
        updated_at = now();

  RETURN QUERY SELECT u.xp, u.week_xp FROM public.user_xp u WHERE u.user_id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.add_user_xp(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.add_user_xp(integer) TO authenticated;

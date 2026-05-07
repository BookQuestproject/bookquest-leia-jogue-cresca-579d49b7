-- =====================================================================
-- 1) classes: remover SELECT amplo que expõe access_code
-- =====================================================================
DROP POLICY IF EXISTS "Anyone can find class by code" ON public.classes;

-- Função de lookup que devolve apenas id e nome de uma turma ativa
-- a partir do código (não expõe o access_code para terceiros).
CREATE OR REPLACE FUNCTION public.find_class_by_code(_code text)
RETURNS TABLE(id uuid, name text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.name
  FROM public.classes c
  WHERE c.access_code = upper(_code)
    AND c.is_active = true
  LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.find_class_by_code(text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.find_class_by_code(text) TO authenticated;

-- =====================================================================
-- 2) edu_teachers: bloquear self-INSERT e exigir validação via função
-- =====================================================================
DROP POLICY IF EXISTS "Users can register as teacher" ON public.edu_teachers;

-- Função de ativação que valida o código no servidor antes de inserir.
-- O código permanece o mesmo já usado no app (BOOKQUEST2026).
CREATE OR REPLACE FUNCTION public.activate_teacher_with_code(_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RETURN false;
  END IF;

  IF upper(_code) <> 'BOOKQUEST2026' THEN
    RETURN false;
  END IF;

  INSERT INTO public.edu_teachers (user_id, activation_code)
  VALUES (uid, upper(_code))
  ON CONFLICT (user_id) DO NOTHING;

  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.activate_teacher_with_code(text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.activate_teacher_with_code(text) TO authenticated;

-- ============= PARTE 0: LIMPEZA DE DADOS DE TESTE =============
-- Apaga turmas, jornadas, progressos e dados relacionados (mantém usuários, professores e catálogo)
TRUNCATE TABLE
  public.edu_journey_chapter_questions,
  public.edu_journey_classes,
  public.edu_journeys,
  public.edu_reports,
  public.edu_class_announcements,
  public.edu_class_challenges,
  public.class_chapter_discussions,
  public.class_question_responses,
  public.class_questions,
  public.class_reading_progress,
  public.class_book_history,
  public.class_next_book,
  public.class_members,
  public.classes
RESTART IDENTITY CASCADE;

-- ============= PARTE 1: NOVOS CAMPOS =============

-- Profiles: dados de professor + flag onboarding aluno EDU + avatar character
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS grades_taught text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS school_name text,
  ADD COLUMN IF NOT EXISTS edu_onboarding_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS avatar_character text;

-- Classes: ano letivo + número aproximado de alunos
ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS school_year integer,
  ADD COLUMN IF NOT EXISTS student_count_estimate integer;

-- Class members: último acesso (status ativo / inativo)
ALTER TABLE public.class_members
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz,
  ADD COLUMN IF NOT EXISTS student_email text;

-- Edu teachers: flags de onboarding
ALTER TABLE public.edu_teachers
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS profile_completed boolean NOT NULL DEFAULT false;

-- ============= RPC: aluno entra na turma usando código (autocadastro) =============
CREATE OR REPLACE FUNCTION public.student_join_class_by_code(_code text, _email text DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

  INSERT INTO public.class_members (class_id, user_id, student_email, last_seen_at)
  VALUES (cls_id, uid, _email, now())
  ON CONFLICT DO NOTHING;

  RETURN cls_id;
END;
$$;

-- ============= RPC: marcar aluno visto agora =============
CREATE OR REPLACE FUNCTION public.touch_class_member_seen(_class_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.class_members
  SET last_seen_at = now()
  WHERE class_id = _class_id AND user_id = auth.uid();
$$;

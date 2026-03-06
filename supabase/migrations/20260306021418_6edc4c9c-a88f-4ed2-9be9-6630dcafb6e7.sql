
-- Table for classes (turmas)
CREATE TABLE public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  grade text, -- série/ano
  book_id text, -- references the book trail
  book_title text,
  reading_deadline date,
  access_code text NOT NULL UNIQUE,
  teacher_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true
);

-- Table for class members (alunos)
CREATE TABLE public.class_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(class_id, user_id)
);

-- Enable RLS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;

-- Classes policies: only admins can manage
CREATE POLICY "Admins can do everything with classes"
  ON public.classes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Students can view classes they belong to
CREATE POLICY "Members can view their class"
  ON public.classes FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.class_members
      WHERE class_members.class_id = classes.id
      AND class_members.user_id = auth.uid()
    )
  );

-- Class members policies
CREATE POLICY "Admins can manage class members"
  ON public.class_members FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own memberships"
  ON public.class_members FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can join classes"
  ON public.class_members FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave classes"
  ON public.class_members FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Trigger for updated_at on classes
CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique access codes
CREATE OR REPLACE FUNCTION public.generate_class_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  code text;
  exists_already boolean;
BEGIN
  LOOP
    code := upper(substr(md5(random()::text), 1, 6));
    SELECT EXISTS(SELECT 1 FROM public.classes WHERE access_code = code) INTO exists_already;
    EXIT WHEN NOT exists_already;
  END LOOP;
  RETURN code;
END;
$$;

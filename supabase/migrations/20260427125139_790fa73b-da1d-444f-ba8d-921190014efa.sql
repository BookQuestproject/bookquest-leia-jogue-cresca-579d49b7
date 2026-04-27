-- ============================================
-- 1. Histórico de livros da turma
-- ============================================
CREATE TABLE public.class_book_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL,
  book_id TEXT,
  book_title TEXT NOT NULL,
  author TEXT,
  total_pages INTEGER,
  started_at DATE NOT NULL,
  ended_at DATE NOT NULL DEFAULT CURRENT_DATE,
  avg_progress NUMERIC,
  members_count INTEGER,
  ended_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_class_book_history_class ON public.class_book_history(class_id);

ALTER TABLE public.class_book_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view own class history"
  ON public.class_book_history FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.classes WHERE classes.id = class_book_history.class_id AND classes.teacher_id = auth.uid()));

CREATE POLICY "Members can view their class history"
  ON public.class_book_history FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.class_members WHERE class_members.class_id = class_book_history.class_id AND class_members.user_id = auth.uid()));

CREATE POLICY "Admins can manage history"
  ON public.class_book_history FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Teachers can insert into own class history"
  ON public.class_book_history FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = ended_by
    AND EXISTS (SELECT 1 FROM public.classes WHERE classes.id = class_book_history.class_id AND classes.teacher_id = auth.uid())
  );

-- ============================================
-- 2. Próximo livro agendado
-- ============================================
CREATE TABLE public.class_next_book (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL UNIQUE,
  book_id TEXT,
  book_title TEXT NOT NULL,
  author TEXT,
  total_pages INTEGER,
  scheduled_start_date DATE NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.class_next_book ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage own class next book"
  ON public.class_next_book FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.classes WHERE classes.id = class_next_book.class_id AND classes.teacher_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.classes WHERE classes.id = class_next_book.class_id AND classes.teacher_id = auth.uid()));

CREATE POLICY "Members can view next book"
  ON public.class_next_book FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.class_members WHERE class_members.class_id = class_next_book.class_id AND class_members.user_id = auth.uid()));

CREATE POLICY "Admins can manage next book"
  ON public.class_next_book FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_class_next_book_updated_at
  BEFORE UPDATE ON public.class_next_book
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 3. Solicitações de novos livros
-- ============================================
CREATE TABLE public.book_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requested_by UUID NOT NULL,
  class_id UUID,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  school_name TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_book_requests_status ON public.book_requests(status);
CREATE INDEX idx_book_requests_requester ON public.book_requests(requested_by);

ALTER TABLE public.book_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers create their book requests"
  ON public.book_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = requested_by
    AND EXISTS (SELECT 1 FROM public.edu_teachers WHERE edu_teachers.user_id = auth.uid())
  );

CREATE POLICY "Users view own book requests"
  ON public.book_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = requested_by);

CREATE POLICY "Admins view all book requests"
  ON public.book_requests FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update book requests"
  ON public.book_requests FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete book requests"
  ON public.book_requests FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_book_requests_updated_at
  BEFORE UPDATE ON public.book_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
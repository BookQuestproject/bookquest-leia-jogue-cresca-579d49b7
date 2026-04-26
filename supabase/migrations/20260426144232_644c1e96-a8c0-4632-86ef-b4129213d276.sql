-- Tabela de contribuições de capítulos
CREATE TABLE public.chapter_contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  book_id TEXT NOT NULL,
  book_title TEXT NOT NULL,
  book_author TEXT,
  chapters JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  ai_verified BOOLEAN DEFAULT false,
  ai_confidence NUMERIC, -- 0..1
  ai_notes TEXT,
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_chapter_contributions_book ON public.chapter_contributions(book_id);
CREATE INDEX idx_chapter_contributions_user ON public.chapter_contributions(user_id);
CREATE INDEX idx_chapter_contributions_status ON public.chapter_contributions(status);

ALTER TABLE public.chapter_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contributions"
  ON public.chapter_contributions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all contributions"
  ON public.chapter_contributions FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create contributions"
  ON public.chapter_contributions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update contributions"
  ON public.chapter_contributions FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete contributions"
  ON public.chapter_contributions FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_chapter_contributions_updated_at
  BEFORE UPDATE ON public.chapter_contributions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Notificação ao usuário quando contribuição muda de status
CREATE OR REPLACE FUNCTION public.notify_chapter_contribution_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
    INSERT INTO public.notifications (user_id, type, title, message, metadata)
    VALUES (
      NEW.user_id,
      CASE WHEN NEW.status = 'approved' THEN 'success' ELSE 'warning' END,
      CASE WHEN NEW.status = 'approved'
        THEN '📖 Capítulos Aprovados!'
        ELSE '📕 Contribuição Não Aprovada'
      END,
      CASE WHEN NEW.status = 'approved'
        THEN 'Sua contribuição de capítulos para "' || NEW.book_title || '" foi aprovada! Você ganhou +50 ✦ Essência e o badge Curador.'
        ELSE 'Sua contribuição para "' || NEW.book_title || '" não foi aprovada. ' || COALESCE(NEW.admin_notes, '')
      END,
      jsonb_build_object('contribution_id', NEW.id, 'book_id', NEW.book_id, 'status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_chapter_contribution
  AFTER UPDATE ON public.chapter_contributions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_chapter_contribution_status();
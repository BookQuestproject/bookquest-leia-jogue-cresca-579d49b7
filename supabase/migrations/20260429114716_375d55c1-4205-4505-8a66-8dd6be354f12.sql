-- Vocabulário do usuário
CREATE TABLE public.user_vocabulary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  word TEXT NOT NULL,
  definition TEXT NOT NULL,
  synonyms TEXT[] DEFAULT '{}',
  example TEXT,
  book_id TEXT,
  book_title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_vocabulary_user ON public.user_vocabulary(user_id);
CREATE INDEX idx_user_vocabulary_book ON public.user_vocabulary(user_id, book_id);
CREATE UNIQUE INDEX idx_user_vocabulary_unique ON public.user_vocabulary(user_id, lower(word), COALESCE(book_id, ''));

ALTER TABLE public.user_vocabulary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own vocabulary" ON public.user_vocabulary
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own vocabulary" ON public.user_vocabulary
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own vocabulary" ON public.user_vocabulary
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Estrutura customizada do livro por usuário
CREATE TABLE public.user_book_structure (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  book_id TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'chapters', -- 'chapters' | 'pages'
  total_chapters INTEGER,
  total_pages INTEGER,
  session_size INTEGER, -- páginas por sessão (modo pages)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, book_id)
);

ALTER TABLE public.user_book_structure ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own structure" ON public.user_book_structure
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own structure" ON public.user_book_structure
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own structure" ON public.user_book_structure
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own structure" ON public.user_book_structure
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_user_book_structure_updated_at
  BEFORE UPDATE ON public.user_book_structure
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Sessões parciais em reading_progress
ALTER TABLE public.reading_progress
  ADD COLUMN IF NOT EXISTS session_type TEXT NOT NULL DEFAULT 'full',
  ADD COLUMN IF NOT EXISTS is_partial BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE public.book_trail_enrichments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id text NOT NULL UNIQUE,
  title text NOT NULL,
  author text NOT NULL,
  chapters jsonb NOT NULL DEFAULT '[]'::jsonb,
  genre text,
  cover_url text,
  total_pages integer,
  theme_color text,
  source text NOT NULL DEFAULT 'ai',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.book_trail_enrichments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view enrichments" ON public.book_trail_enrichments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage enrichments" ON public.book_trail_enrichments
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));


-- Table for the monthly book club selection
CREATE TABLE public.book_club_monthly (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month_year text NOT NULL, -- e.g. '2026-03'
  book_title text NOT NULL,
  book_author text NOT NULL,
  book_cover_url text,
  description text,
  status text NOT NULL DEFAULT 'active', -- active, upcoming, completed
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(month_year)
);

ALTER TABLE public.book_club_monthly ENABLE ROW LEVEL SECURITY;

-- Everyone can read active monthly books
CREATE POLICY "Anyone can view monthly books" ON public.book_club_monthly
  FOR SELECT TO authenticated USING (true);

-- Only admins can manage
CREATE POLICY "Admins can manage monthly books" ON public.book_club_monthly
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Table for book club content (PDFs, videos, etc.)
CREATE TABLE public.book_club_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  monthly_id uuid REFERENCES public.book_club_monthly(id) ON DELETE CASCADE NOT NULL,
  content_type text NOT NULL, -- 'review_pdf', 'video', 'analysis', 'author_preview'
  title text NOT NULL,
  description text,
  file_url text,
  sort_order int NOT NULL DEFAULT 0,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.book_club_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view club content" ON public.book_club_content
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage club content" ON public.book_club_content
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for book club files
INSERT INTO storage.buckets (id, name, public) VALUES ('book-club', 'book-club', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can read book-club files" ON storage.objects
  FOR SELECT USING (bucket_id = 'book-club');

CREATE POLICY "Admins can upload book-club files" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'book-club' AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete book-club files" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'book-club' AND public.has_role(auth.uid(), 'admin')
  );

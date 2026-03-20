
-- Table to store admin overrides for book data
CREATE TABLE public.book_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id text NOT NULL UNIQUE,
  title text,
  author text,
  cover_url text,
  description text,
  detailed_description text,
  genre text,
  updated_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.book_overrides ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage book overrides"
ON public.book_overrides
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- All authenticated users can view overrides
CREATE POLICY "Authenticated users can view book overrides"
ON public.book_overrides
FOR SELECT
TO authenticated
USING (true);

-- Auto-update updated_at
CREATE TRIGGER update_book_overrides_updated_at
  BEFORE UPDATE ON public.book_overrides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

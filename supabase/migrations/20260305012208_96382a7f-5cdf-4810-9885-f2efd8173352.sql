ALTER TABLE public.book_suggestions 
  ADD COLUMN IF NOT EXISTS cover_url text,
  ADD COLUMN IF NOT EXISTS genre text,
  ADD COLUMN IF NOT EXISTS publication_year integer,
  ADD COLUMN IF NOT EXISTS external_link text,
  ADD COLUMN IF NOT EXISTS ai_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS ai_verification_data jsonb;
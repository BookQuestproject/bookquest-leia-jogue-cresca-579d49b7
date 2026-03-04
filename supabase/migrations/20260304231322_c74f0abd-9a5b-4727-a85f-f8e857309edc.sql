-- Allow all authenticated users to read approved book suggestions
CREATE POLICY "Authenticated users can view approved suggestions"
  ON book_suggestions FOR SELECT
  TO authenticated
  USING (status = 'approved');
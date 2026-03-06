
-- Allow authenticated users to find profiles by email (for social challenges)
CREATE POLICY "Users can find profiles by email"
  ON public.profiles FOR SELECT TO authenticated
  USING (true);

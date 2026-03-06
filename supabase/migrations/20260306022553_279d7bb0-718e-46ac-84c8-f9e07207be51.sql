
CREATE POLICY "Users can delete own diagnosis"
  ON public.academic_diagnosis FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

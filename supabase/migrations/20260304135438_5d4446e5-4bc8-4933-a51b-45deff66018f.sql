
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own sessions" ON mentorship_sessions;
DROP POLICY IF EXISTS "Premium users can create their own sessions" ON mentorship_sessions;
DROP POLICY IF EXISTS "Premium users can delete their own sessions" ON mentorship_sessions;
DROP POLICY IF EXISTS "Premium users can update their own sessions" ON mentorship_sessions;
DROP POLICY IF EXISTS "Admins can view all mentorship sessions" ON mentorship_sessions;
DROP POLICY IF EXISTS "Admins can update mentorship sessions" ON mentorship_sessions;

-- Recreate with explicit TO authenticated
CREATE POLICY "Users can view their own sessions"
  ON mentorship_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all mentorship sessions"
  ON mentorship_sessions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Premium users can create their own sessions"
  ON mentorship_sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
          AND profiles.is_premium = true
          AND (profiles.premium_expires_at IS NULL OR profiles.premium_expires_at > now())
      )
    )
  );

CREATE POLICY "Premium users can update their own sessions"
  ON mentorship_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update mentorship sessions"
  ON mentorship_sessions FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Premium users can delete their own sessions"
  ON mentorship_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

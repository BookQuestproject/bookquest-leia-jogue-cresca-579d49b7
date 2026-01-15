-- Drop existing INSERT policy for mentorship sessions
DROP POLICY IF EXISTS "Users can create their own sessions" ON mentorship_sessions;

-- Create new INSERT policy that requires premium status
CREATE POLICY "Premium users can create their own sessions" 
ON mentorship_sessions FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_premium = true
    AND (profiles.premium_expires_at IS NULL OR profiles.premium_expires_at > now())
  )
);

-- Update DELETE policy to also check premium status
DROP POLICY IF EXISTS "Users can delete their own sessions" ON mentorship_sessions;
CREATE POLICY "Premium users can delete their own sessions" 
ON mentorship_sessions FOR DELETE
USING (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_premium = true
    AND (profiles.premium_expires_at IS NULL OR profiles.premium_expires_at > now())
  )
);

-- Update UPDATE policy to also check premium status
DROP POLICY IF EXISTS "Users can update their own sessions" ON mentorship_sessions;
CREATE POLICY "Premium users can update their own sessions" 
ON mentorship_sessions FOR UPDATE
USING (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_premium = true
    AND (profiles.premium_expires_at IS NULL OR profiles.premium_expires_at > now())
  )
);
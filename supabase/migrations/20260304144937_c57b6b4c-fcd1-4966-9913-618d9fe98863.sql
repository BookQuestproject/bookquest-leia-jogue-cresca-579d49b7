
-- Fix WARNING: Restrict mentors to authenticated users only
DROP POLICY IF EXISTS "Anyone can view active mentors" ON mentors;
CREATE POLICY "Authenticated users can view active mentors"
  ON mentors FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Fix WARNING: Restrict mentorship_tracks to authenticated users only
DROP POLICY IF EXISTS "Anyone can view active tracks" ON mentorship_tracks;
CREATE POLICY "Authenticated users can view active tracks"
  ON mentorship_tracks FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Fix INFO: Restrict available_slots to authenticated users
DROP POLICY IF EXISTS "Anyone can view available slots" ON available_slots;
CREATE POLICY "Authenticated users can view available slots"
  ON available_slots FOR SELECT
  TO authenticated
  USING (true);

-- Fix INFO: Restrict mentor_tracks to authenticated users
DROP POLICY IF EXISTS "Anyone can view mentor tracks" ON mentor_tracks;
CREATE POLICY "Authenticated users can view mentor tracks"
  ON mentor_tracks FOR SELECT
  TO authenticated
  USING (true);

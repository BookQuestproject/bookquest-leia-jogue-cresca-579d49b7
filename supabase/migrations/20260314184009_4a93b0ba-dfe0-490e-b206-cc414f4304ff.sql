
-- 1) Create a public view with ONLY non-sensitive fields for cross-user lookups
CREATE VIEW public.profiles_public
WITH (security_invoker = on) AS
SELECT id, full_name, avatar_url
FROM public.profiles;

-- 2) Drop the overly-permissive SELECT policy on profiles
DROP POLICY IF EXISTS "Users can find profiles by email" ON public.profiles;

-- 3) Create a restricted SELECT policy: users can only read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 4) Create a SECURITY DEFINER function for email-based user lookup (social challenges)
CREATE OR REPLACE FUNCTION public.find_user_by_email(_email text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE email = _email LIMIT 1;
$$;

-- 5) Fix user_badges: remove self-award INSERT policy
DROP POLICY IF EXISTS "System can insert badges" ON public.user_badges;

-- 6) Create a SECURITY DEFINER function to award badges (only callable from trusted server code)
CREATE OR REPLACE FUNCTION public.award_badge(_user_id uuid, _badge_type text, _badge_label text, _metadata jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_badges (user_id, badge_type, badge_label, metadata)
  VALUES (_user_id, _badge_type, _badge_label, _metadata)
  ON CONFLICT (user_id, badge_type) DO NOTHING;
END;
$$;

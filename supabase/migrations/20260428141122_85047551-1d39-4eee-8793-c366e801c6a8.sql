-- Fix 1: user_titles — remove client-side INSERT to prevent self-awarding
DROP POLICY IF EXISTS "System can insert titles" ON public.user_titles;

-- Fix 2: founder_subscriptions — remove broad SELECT exposure, replace with count function
DROP POLICY IF EXISTS "Anyone can count founders" ON public.founder_subscriptions;

CREATE OR REPLACE FUNCTION public.get_founder_count()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer FROM public.founder_subscriptions;
$$;

REVOKE ALL ON FUNCTION public.get_founder_count() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_founder_count() TO anon, authenticated;

-- Fix 3: community_members — restrict SELECT to authenticated users (members of any community)
DROP POLICY IF EXISTS "Anyone can view community members" ON public.community_members;

CREATE POLICY "Authenticated users can view community members"
ON public.community_members
FOR SELECT
TO authenticated
USING (true);
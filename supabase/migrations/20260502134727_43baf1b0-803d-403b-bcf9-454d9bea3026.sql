
-- 1) Force the public view to run as the querying user (not creator)
ALTER VIEW public.profiles_public SET (security_invoker = true);

-- 2) Revoke EXECUTE on SECURITY DEFINER functions that should never be
--    invoked directly by anon/authenticated clients (these are used by
--    triggers or service-role edge functions only).
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_profile_xp() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.set_referral_code() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.notify_new_news() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.notify_suggestion_status_change() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.notify_chapter_contribution_status() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.award_badge(uuid, text, text, jsonb) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.find_user_by_email(text) FROM anon, authenticated, public;

-- Keep these callable, but only by signed-in users (not anon)
REVOKE EXECUTE ON FUNCTION public.tick_user_streak(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_founder_count() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.tick_user_streak(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_founder_count() TO authenticated, anon;

-- 3) Restrict storage object listing on public buckets.
--    Public URLs (object GET by name) keep working because the bucket is public;
--    only the broad LIST/SELECT policy is removed, preventing enumeration.
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read book-club files" ON storage.objects;

CREATE POLICY "Authenticated users can list avatars"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can list book-club files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'book-club');

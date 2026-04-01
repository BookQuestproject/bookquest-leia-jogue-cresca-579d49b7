CREATE OR REPLACE VIEW public.profiles_public AS
SELECT id, full_name, avatar_url, username
FROM public.profiles;
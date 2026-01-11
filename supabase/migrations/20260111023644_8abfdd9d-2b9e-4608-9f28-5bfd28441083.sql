-- Add explicit policy to deny anonymous access to profiles (defense in depth)
-- This is an extra layer of security, even though (auth.uid() = id) already blocks anonymous access

-- First drop and recreate the SELECT policy with explicit auth check
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = id);

-- Also ensure mentorship_sessions has explicit auth check
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.mentorship_sessions;

CREATE POLICY "Users can view their own sessions" 
ON public.mentorship_sessions 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);
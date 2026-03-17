
-- Add username column to profiles (unique, lowercase, no spaces)
ALTER TABLE public.profiles ADD COLUMN username text;

-- Create unique index for username
CREATE UNIQUE INDEX profiles_username_unique ON public.profiles (username) WHERE username IS NOT NULL;

-- Add assigned_tier and week tracking to user_xp for weekly promotions
ALTER TABLE public.user_xp ADD COLUMN assigned_tier text NOT NULL DEFAULT 'bronze';
ALTER TABLE public.user_xp ADD COLUMN week_xp integer NOT NULL DEFAULT 0;
ALTER TABLE public.user_xp ADD COLUMN last_week_reset timestamp with time zone;

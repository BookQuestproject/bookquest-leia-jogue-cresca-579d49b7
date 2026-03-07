
-- Create user_xp table to track ranking data
CREATE TABLE public.user_xp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  xp integer NOT NULL DEFAULT 0,
  streak integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;

-- Everyone can view all XP (ranking is public)
CREATE POLICY "Anyone can view xp" ON public.user_xp
  FOR SELECT TO authenticated USING (true);

-- Users can insert their own XP row
CREATE POLICY "Users can insert own xp" ON public.user_xp
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can update their own XP
CREATE POLICY "Users can update own xp" ON public.user_xp
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Auto-create user_xp row when a new profile is created
CREATE OR REPLACE FUNCTION public.handle_new_profile_xp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_xp (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_add_xp
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_profile_xp();

-- Also insert for existing profiles
INSERT INTO public.user_xp (user_id)
SELECT id FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;


-- Social Challenges table
CREATE TABLE public.social_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id uuid NOT NULL,
  challenged_id uuid NOT NULL,
  challenge_type text NOT NULL, -- 'streak_7days', 'read_3chapters', 'finish_book'
  title text NOT NULL,
  description text,
  goal_value integer NOT NULL DEFAULT 1,
  challenger_progress integer NOT NULL DEFAULT 0,
  challenged_progress integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending', -- pending, active, completed, declined, expired
  winner_id uuid,
  xp_reward integer NOT NULL DEFAULT 50,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Streak Freezes inventory
CREATE TABLE public.streak_freezes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  used_dates text[] DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Reading Plans (guided reading)
CREATE TABLE public.reading_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  book_id text NOT NULL,
  book_title text,
  total_pages integer NOT NULL,
  daily_minutes integer NOT NULL, -- 10, 20, 30
  daily_pages integer NOT NULL,
  current_day integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- Enable RLS
ALTER TABLE public.social_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_freezes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_plans ENABLE ROW LEVEL SECURITY;

-- Social Challenges policies
CREATE POLICY "Users can view their challenges"
  ON public.social_challenges FOR SELECT TO authenticated
  USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

CREATE POLICY "Users can create challenges"
  ON public.social_challenges FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = challenger_id);

CREATE POLICY "Participants can update challenges"
  ON public.social_challenges FOR UPDATE TO authenticated
  USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

-- Streak Freezes policies
CREATE POLICY "Users can view own freezes"
  ON public.streak_freezes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own freezes"
  ON public.streak_freezes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own freezes"
  ON public.streak_freezes FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Reading Plans policies
CREATE POLICY "Users can view own plans"
  ON public.reading_plans FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own plans"
  ON public.reading_plans FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans"
  ON public.reading_plans FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plans"
  ON public.reading_plans FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_social_challenges_updated_at
  BEFORE UPDATE ON public.social_challenges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_streak_freezes_updated_at
  BEFORE UPDATE ON public.streak_freezes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reading_plans_updated_at
  BEFORE UPDATE ON public.reading_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

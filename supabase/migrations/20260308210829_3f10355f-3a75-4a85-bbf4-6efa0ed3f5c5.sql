
-- Founder subscriptions tracker (limit 200)
CREATE TABLE public.founder_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  purchased_at timestamptz NOT NULL DEFAULT now(),
  stripe_session_id text,
  is_active boolean NOT NULL DEFAULT true
);

ALTER TABLE public.founder_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can count founders" ON public.founder_subscriptions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can view own founder sub" ON public.founder_subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- User badges
CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_type text NOT NULL,
  badge_label text NOT NULL,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}',
  UNIQUE(user_id, badge_type)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges" ON public.user_badges
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view badges" ON public.user_badges
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "System can insert badges" ON public.user_badges
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- User titles
CREATE TABLE public.user_titles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, title)
);

ALTER TABLE public.user_titles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own titles" ON public.user_titles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active titles" ON public.user_titles
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Users can update own titles" ON public.user_titles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "System can insert titles" ON public.user_titles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

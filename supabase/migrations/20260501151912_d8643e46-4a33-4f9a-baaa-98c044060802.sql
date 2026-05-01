
-- 1. Add streak tracking column
ALTER TABLE public.user_xp
ADD COLUMN IF NOT EXISTS last_streak_date date;

-- 2. Streak tick function (idempotent per day)
CREATE OR REPLACE FUNCTION public.tick_user_streak(_user_id uuid)
RETURNS TABLE(streak integer, was_updated boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_streak integer;
  last_date date;
  today date := (now() AT TIME ZONE 'UTC')::date;
  new_streak integer;
BEGIN
  -- Ensure row exists
  INSERT INTO public.user_xp (user_id) VALUES (_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT user_xp.streak, user_xp.last_streak_date
    INTO current_streak, last_date
  FROM public.user_xp
  WHERE user_id = _user_id;

  IF last_date = today THEN
    -- Already ticked today
    RETURN QUERY SELECT current_streak, false;
    RETURN;
  ELSIF last_date = today - INTERVAL '1 day' THEN
    new_streak := current_streak + 1;
  ELSE
    -- First time or missed a day
    new_streak := 1;
  END IF;

  UPDATE public.user_xp
  SET streak = new_streak,
      last_streak_date = today,
      updated_at = now()
  WHERE user_id = _user_id;

  RETURN QUERY SELECT new_streak, true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.tick_user_streak(uuid) TO authenticated;

-- 3. Schedule weekly ranking promotion (every Monday 03:00 UTC = ~00:00 BRT)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Drop existing job if it exists
DO $$
DECLARE
  job_id bigint;
BEGIN
  SELECT jobid INTO job_id FROM cron.job WHERE jobname = 'weekly-ranking-promotion';
  IF job_id IS NOT NULL THEN
    PERFORM cron.unschedule(job_id);
  END IF;
END $$;

SELECT cron.schedule(
  'weekly-ranking-promotion',
  '0 3 * * 1',
  $$
  SELECT net.http_post(
    url := 'https://ombgarohzfzuijhvwbfk.supabase.co/functions/v1/weekly-ranking-promotion',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tYmdhcm9oemZ6dWlqaHZ3YmZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3OTcyMDQsImV4cCI6MjA4MzM3MzIwNH0.mafY7hBpxaSOXx-NNn8IvnJbbcmpzTS8l15UWPJjlSc"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

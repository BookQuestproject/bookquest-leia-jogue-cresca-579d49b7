-- Create profiles table to store user data and quiz results
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  literary_profile JSONB,
  quiz_completed BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create function to handle new user signup
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name'
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create mentorship_sessions table
CREATE TABLE public.mentorship_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  session_date DATE NOT NULL,
  session_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mentorship_sessions ENABLE ROW LEVEL SECURITY;

-- Mentorship policies
CREATE POLICY "Users can view their own sessions"
  ON public.mentorship_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
  ON public.mentorship_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.mentorship_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON public.mentorship_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Create available_slots table for mentorship scheduling
CREATE TABLE public.available_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  time_slot TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- Enable RLS (public read for available slots)
ALTER TABLE public.available_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available slots"
  ON public.available_slots FOR SELECT
  USING (TRUE);

-- Insert default available slots (Monday to Friday, 9am to 6pm)
INSERT INTO public.available_slots (day_of_week, time_slot) VALUES
  (1, '09:00'), (1, '10:00'), (1, '11:00'), (1, '14:00'), (1, '15:00'), (1, '16:00'), (1, '17:00'),
  (2, '09:00'), (2, '10:00'), (2, '11:00'), (2, '14:00'), (2, '15:00'), (2, '16:00'), (2, '17:00'),
  (3, '09:00'), (3, '10:00'), (3, '11:00'), (3, '14:00'), (3, '15:00'), (3, '16:00'), (3, '17:00'),
  (4, '09:00'), (4, '10:00'), (4, '11:00'), (4, '14:00'), (4, '15:00'), (4, '16:00'), (4, '17:00'),
  (5, '09:00'), (5, '10:00'), (5, '11:00'), (5, '14:00'), (5, '15:00'), (5, '16:00'), (5, '17:00');

-- Create update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add trigger for profiles update
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
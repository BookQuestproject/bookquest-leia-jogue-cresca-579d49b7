-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (avoids recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Policy: Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Admins can view all roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Policy: Admins can manage all roles
CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create book_suggestions table
CREATE TABLE public.book_suggestions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    title TEXT NOT NULL,
    author TEXT,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on book_suggestions
ALTER TABLE public.book_suggestions ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can create suggestions
CREATE POLICY "Users can create suggestions"
ON public.book_suggestions FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Policy: Users can view their own suggestions
CREATE POLICY "Users can view their own suggestions"
ON public.book_suggestions FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Admins can view all suggestions
CREATE POLICY "Admins can view all suggestions"
ON public.book_suggestions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Policy: Admins can update suggestions (approve/reject)
CREATE POLICY "Admins can update suggestions"
ON public.book_suggestions FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Policy: Admins can delete suggestions
CREATE POLICY "Admins can delete suggestions"
ON public.book_suggestions FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Policy: Admins can view all mentorship sessions
CREATE POLICY "Admins can view all mentorship sessions"
ON public.mentorship_sessions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Policy: Admins can update mentorship sessions
CREATE POLICY "Admins can update mentorship sessions"
ON public.mentorship_sessions FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Policy: Admins can manage available slots
CREATE POLICY "Admins can insert available slots"
ON public.available_slots FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update available slots"
ON public.available_slots FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete available slots"
ON public.available_slots FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to update updated_at on book_suggestions
CREATE TRIGGER update_book_suggestions_updated_at
BEFORE UPDATE ON public.book_suggestions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
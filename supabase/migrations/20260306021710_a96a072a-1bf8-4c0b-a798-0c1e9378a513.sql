
-- Allow admins to view all profiles (for class member info)
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow reading class by access_code for joining
CREATE POLICY "Anyone can find class by code"
  ON public.classes FOR SELECT TO authenticated
  USING (is_active = true);

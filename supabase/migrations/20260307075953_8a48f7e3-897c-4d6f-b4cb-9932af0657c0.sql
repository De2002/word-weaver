-- Allow anyone to see if a user has the 'pro' role (needed to show PRO badge on public profiles)
CREATE POLICY "Anyone can view pro roles"
  ON public.user_roles
  FOR SELECT
  USING (role = 'pro'::app_role);
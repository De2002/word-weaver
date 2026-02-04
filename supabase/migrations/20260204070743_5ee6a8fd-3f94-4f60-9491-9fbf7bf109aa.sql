-- Add admin access policies for full platform visibility

-- Profiles: Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Poems: Admins can view all poems (including drafts)
CREATE POLICY "Admins can view all poems"
ON public.poems FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Events: Admins can view all events (including pending)
CREATE POLICY "Admins can view all events"
ON public.events FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Trails: Admins can view all trails
CREATE POLICY "Admins can view all trails"
ON public.trails FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Trail steps: Admins can view all trail steps
CREATE POLICY "Admins can view all trail steps"
ON public.trail_steps FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Chapbooks: Admins can view all chapbooks (including pending)
CREATE POLICY "Admins can view all chapbooks"
ON public.chapbooks FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Journals: Admins can view all journals
CREATE POLICY "Admins can view all journals"
ON public.journals FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- User roles: Admins can view all user roles
CREATE POLICY "Admins can view all user roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Message reports: Already has admin policy, but ensure it works
-- (message_reports already has moderator/admin policies)

-- Notifications: Admins can view all notifications for moderation
CREATE POLICY "Admins can view all notifications"
ON public.notifications FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Messages: Admins can view all messages for moderation
CREATE POLICY "Admins can view all messages"
ON public.messages FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));
-- Create blocked_users table
CREATE TABLE public.blocked_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID NOT NULL,
  blocked_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- Enable RLS
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- RLS policies for blocked_users
CREATE POLICY "Users can view their blocks"
  ON public.blocked_users FOR SELECT
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can block others"
  ON public.blocked_users FOR INSERT
  WITH CHECK (auth.uid() = blocker_id AND auth.uid() != blocked_id);

CREATE POLICY "Users can unblock"
  ON public.blocked_users FOR DELETE
  USING (auth.uid() = blocker_id);

-- Create message_reports table
CREATE TABLE public.message_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(reporter_id, message_id)
);

-- Enable RLS
ALTER TABLE public.message_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies for message_reports
CREATE POLICY "Users can view their own reports"
  ON public.message_reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users can submit reports"
  ON public.message_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Moderators/admins can view all reports
CREATE POLICY "Moderators can view all reports"
  ON public.message_reports FOR SELECT
  USING (has_role(auth.uid(), 'moderator') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Moderators can update reports"
  ON public.message_reports FOR UPDATE
  USING (has_role(auth.uid(), 'moderator') OR has_role(auth.uid(), 'admin'));

-- Create indexes
CREATE INDEX idx_blocked_users_blocker ON public.blocked_users(blocker_id);
CREATE INDEX idx_blocked_users_blocked ON public.blocked_users(blocked_id);
CREATE INDEX idx_message_reports_status ON public.message_reports(status);
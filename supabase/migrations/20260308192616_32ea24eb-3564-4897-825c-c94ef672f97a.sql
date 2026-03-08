
-- Add account_status column to profiles for ban/suspend/terminate
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_status text NOT NULL DEFAULT 'active';

-- Create user_reports table
CREATE TABLE IF NOT EXISTS public.user_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id uuid NOT NULL,
  reported_user_id uuid NOT NULL,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'pending',
  admin_note text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_reports_reporter_reported_unique UNIQUE (reporter_id, reported_user_id)
);

-- Enable RLS
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_reports
CREATE POLICY "Users can submit user reports" ON public.user_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id AND auth.uid() != reported_user_id);

CREATE POLICY "Users can view own user reports" ON public.user_reports
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all user reports" ON public.user_reports
  FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role)
  );

CREATE POLICY "Admins can update user reports" ON public.user_reports
  FOR UPDATE USING (
    has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role)
  );

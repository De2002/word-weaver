
-- challenges table
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  prompt TEXT NOT NULL,
  theme TEXT,
  prize_description TEXT,
  cover_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  month TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  winner_submission_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- challenge_submissions table
CREATE TABLE public.challenge_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  poem_id UUID NOT NULL REFERENCES public.poems(id) ON DELETE CASCADE,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  is_winner BOOLEAN NOT NULL DEFAULT false,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- updated_at trigger
CREATE TRIGGER update_challenges_updated_at
  BEFORE UPDATE ON public.challenges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS: challenges
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active challenges"
  ON public.challenges FOR SELECT
  USING (status IN ('active', 'judging', 'closed'));

CREATE POLICY "Admins can view all challenges"
  ON public.challenges FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert challenges"
  ON public.challenges FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update challenges"
  ON public.challenges FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete challenges"
  ON public.challenges FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS: challenge_submissions
ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved submissions for active challenges"
  ON public.challenge_submissions FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can view own submissions"
  ON public.challenge_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all submissions"
  ON public.challenge_submissions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Pro poets can submit to challenges"
  ON public.challenge_submissions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND has_role(auth.uid(), 'pro'::app_role)
  );

CREATE POLICY "Admins can update submissions"
  ON public.challenge_submissions FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete own pending submissions"
  ON public.challenge_submissions FOR DELETE
  USING (auth.uid() = user_id AND status = 'pending');

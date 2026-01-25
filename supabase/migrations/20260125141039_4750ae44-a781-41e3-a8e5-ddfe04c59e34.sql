-- Create trails table
CREATE TABLE public.trails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('theme', 'emotion', 'challenge')),
  mood TEXT,
  curation_note TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create trail_steps table (poems in trails)
CREATE TABLE public.trail_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trail_id UUID NOT NULL REFERENCES public.trails(id) ON DELETE CASCADE,
  poem_id UUID NOT NULL REFERENCES public.poems(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(trail_id, poem_id),
  UNIQUE(trail_id, step_order)
);

-- Create trail_step_reactions (emoji reactions on individual poems in trails)
CREATE TABLE public.trail_step_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trail_step_id UUID NOT NULL REFERENCES public.trail_steps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL CHECK (emoji IN ('❤️', '💭', '🌧️', '✨', '😮')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(trail_step_id, user_id, emoji)
);

-- Create trail_progress (user progress tracking)
CREATE TABLE public.trail_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trail_id UUID NOT NULL REFERENCES public.trails(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 1,
  completed BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(trail_id, user_id)
);

-- Create trail_reviews (end of trail reviews)
CREATE TABLE public.trail_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trail_id UUID NOT NULL REFERENCES public.trails(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  comment TEXT CHECK (char_length(comment) <= 120),
  favorite_step_id UUID REFERENCES public.trail_steps(id) ON DELETE SET NULL,
  emotion TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(trail_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.trails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trail_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trail_step_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trail_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trail_reviews ENABLE ROW LEVEL SECURITY;

-- Trails policies
CREATE POLICY "Anyone can view published trails" ON public.trails
  FOR SELECT USING (status = 'published');

CREATE POLICY "Users can view own trails" ON public.trails
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create trails" ON public.trails
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trails" ON public.trails
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trails" ON public.trails
  FOR DELETE USING (auth.uid() = user_id);

-- Trail steps policies
CREATE POLICY "Anyone can view steps of published trails" ON public.trail_steps
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.trails WHERE id = trail_id AND status = 'published')
  );

CREATE POLICY "Trail owners can view own trail steps" ON public.trail_steps
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.trails WHERE id = trail_id AND user_id = auth.uid())
  );

CREATE POLICY "Trail owners can add steps" ON public.trail_steps
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.trails WHERE id = trail_id AND user_id = auth.uid())
  );

CREATE POLICY "Trail owners can update steps" ON public.trail_steps
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.trails WHERE id = trail_id AND user_id = auth.uid())
  );

CREATE POLICY "Trail owners can delete steps" ON public.trail_steps
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.trails WHERE id = trail_id AND user_id = auth.uid())
  );

-- Trail step reactions policies
CREATE POLICY "Anyone can view step reactions" ON public.trail_step_reactions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add reactions" ON public.trail_step_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own reactions" ON public.trail_step_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- Trail progress policies
CREATE POLICY "Users can view own progress" ON public.trail_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can track progress" ON public.trail_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.trail_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Trail reviews policies
CREATE POLICY "Anyone can view reviews" ON public.trail_reviews
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add reviews" ON public.trail_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON public.trail_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON public.trail_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_trails_updated_at
  BEFORE UPDATE ON public.trails
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trail_progress_updated_at
  BEFORE UPDATE ON public.trail_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
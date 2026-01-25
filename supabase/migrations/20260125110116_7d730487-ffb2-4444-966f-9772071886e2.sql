-- Create introductions table for community welcomes
CREATE TABLE public.introductions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reactions table for emoji welcomes
CREATE TABLE public.introduction_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  introduction_id UUID NOT NULL REFERENCES public.introductions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL CHECK (emoji IN ('👋', '🎉', '❤️')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(introduction_id, user_id, emoji)
);

-- Enable RLS
ALTER TABLE public.introductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.introduction_reactions ENABLE ROW LEVEL SECURITY;

-- Introductions policies
CREATE POLICY "Anyone can view introductions"
  ON public.introductions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create introductions"
  ON public.introductions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own introductions"
  ON public.introductions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own introductions"
  ON public.introductions FOR DELETE
  USING (auth.uid() = user_id);

-- Reactions policies
CREATE POLICY "Anyone can view reactions"
  ON public.introduction_reactions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add reactions"
  ON public.introduction_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own reactions"
  ON public.introduction_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_introductions_created_at ON public.introductions(created_at DESC);
CREATE INDEX idx_introduction_reactions_intro_id ON public.introduction_reactions(introduction_id);

-- Add to realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.introductions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.introduction_reactions;
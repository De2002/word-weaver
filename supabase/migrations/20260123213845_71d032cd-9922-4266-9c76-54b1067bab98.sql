-- Create poem_upvotes table
CREATE TABLE public.poem_upvotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  poem_id UUID NOT NULL REFERENCES public.poems(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, poem_id)
);

-- Create poem_saves table
CREATE TABLE public.poem_saves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  poem_id UUID NOT NULL REFERENCES public.poems(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, poem_id)
);

-- Create poem_reads table (tracks unique reads per user)
CREATE TABLE public.poem_reads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  poem_id UUID NOT NULL REFERENCES public.poems(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, poem_id)
);

-- Enable RLS on all tables
ALTER TABLE public.poem_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poem_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poem_reads ENABLE ROW LEVEL SECURITY;

-- Upvotes policies
CREATE POLICY "Anyone can view upvotes" ON public.poem_upvotes FOR SELECT USING (true);
CREATE POLICY "Users can upvote" ON public.poem_upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own upvote" ON public.poem_upvotes FOR DELETE USING (auth.uid() = user_id);

-- Saves policies
CREATE POLICY "Users can view own saves" ON public.poem_saves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save poems" ON public.poem_saves FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave poems" ON public.poem_saves FOR DELETE USING (auth.uid() = user_id);

-- Reads policies (allow anonymous reads for tracking)
CREATE POLICY "Anyone can view read counts" ON public.poem_reads FOR SELECT USING (true);
CREATE POLICY "Anyone can record reads" ON public.poem_reads FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_poem_upvotes_poem ON public.poem_upvotes(poem_id);
CREATE INDEX idx_poem_upvotes_user ON public.poem_upvotes(user_id);
CREATE INDEX idx_poem_saves_poem ON public.poem_saves(poem_id);
CREATE INDEX idx_poem_saves_user ON public.poem_saves(user_id);
CREATE INDEX idx_poem_reads_poem ON public.poem_reads(poem_id);
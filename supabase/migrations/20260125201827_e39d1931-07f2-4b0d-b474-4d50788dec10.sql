-- Create journals table for poet long-form content
CREATE TABLE public.journals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create journal likes table
CREATE TABLE public.journal_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  journal_id UUID NOT NULL REFERENCES public.journals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(journal_id, user_id)
);

-- Create journal comments table (non-threaded)
CREATE TABLE public.journal_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  journal_id UUID NOT NULL REFERENCES public.journals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_comments ENABLE ROW LEVEL SECURITY;

-- Journals policies
CREATE POLICY "Published journals are viewable by everyone"
  ON public.journals FOR SELECT
  USING (status = 'published');

CREATE POLICY "Users can view their own journals"
  ON public.journals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own journals"
  ON public.journals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journals"
  ON public.journals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journals"
  ON public.journals FOR DELETE
  USING (auth.uid() = user_id);

-- Journal likes policies
CREATE POLICY "Journal likes are viewable by everyone"
  ON public.journal_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like journals"
  ON public.journal_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike journals"
  ON public.journal_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Journal comments policies
CREATE POLICY "Journal comments are viewable by everyone"
  ON public.journal_comments FOR SELECT
  USING (true);

CREATE POLICY "Users can create comments"
  ON public.journal_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.journal_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_journals_user_id ON public.journals(user_id);
CREATE INDEX idx_journals_status ON public.journals(status);
CREATE INDEX idx_journals_created_at ON public.journals(created_at DESC);
CREATE INDEX idx_journal_likes_journal_id ON public.journal_likes(journal_id);
CREATE INDEX idx_journal_comments_journal_id ON public.journal_comments(journal_id);

-- Trigger for updated_at
CREATE TRIGGER update_journals_updated_at
  BEFORE UPDATE ON public.journals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.journals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.journal_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.journal_comments;
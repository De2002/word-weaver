
-- Classic Poets table
CREATE TABLE public.classic_poets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  bio TEXT,
  about TEXT,
  born_year INTEGER,
  died_year INTEGER,
  nationality TEXT,
  image_url TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Classic Poems table
CREATE TABLE public.classic_poems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poet_id UUID NOT NULL REFERENCES public.classic_poets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  published_year INTEGER,
  source TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for search & performance
CREATE INDEX idx_classic_poets_slug ON public.classic_poets(slug);
CREATE INDEX idx_classic_poets_featured ON public.classic_poets(featured);
CREATE INDEX idx_classic_poems_slug ON public.classic_poems(slug);
CREATE INDEX idx_classic_poems_poet_id ON public.classic_poems(poet_id);
CREATE INDEX idx_classic_poems_status ON public.classic_poems(status);
CREATE INDEX idx_classic_poems_featured ON public.classic_poems(featured);
CREATE INDEX idx_classic_poems_tags ON public.classic_poems USING GIN(tags);

-- Enable RLS
ALTER TABLE public.classic_poets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classic_poems ENABLE ROW LEVEL SECURITY;

-- Classic Poets RLS
CREATE POLICY "Anyone can view classic poets"
  ON public.classic_poets FOR SELECT USING (true);

CREATE POLICY "Admins can insert classic poets"
  ON public.classic_poets FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update classic poets"
  ON public.classic_poets FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete classic poets"
  ON public.classic_poets FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Classic Poems RLS
CREATE POLICY "Anyone can view published classic poems"
  ON public.classic_poems FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can view all classic poems"
  ON public.classic_poems FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert classic poems"
  ON public.classic_poems FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update classic poems"
  ON public.classic_poems FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete classic poems"
  ON public.classic_poems FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Timestamp triggers
CREATE TRIGGER update_classic_poets_updated_at
  BEFORE UPDATE ON public.classic_poets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_classic_poems_updated_at
  BEFORE UPDATE ON public.classic_poems
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

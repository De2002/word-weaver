-- Create chapbooks table for the discovery catalog
CREATE TABLE public.chapbooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  poet_name TEXT NOT NULL,
  cover_url TEXT,
  description TEXT,
  genre_tags TEXT[] NOT NULL DEFAULT '{}',
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  is_free BOOLEAN NOT NULL DEFAULT false,
  format TEXT NOT NULL, -- 'pdf', 'print', 'ebook', 'multiple'
  country TEXT,
  year INTEGER,
  external_links JSONB NOT NULL DEFAULT '{}', -- {"publisher": "url", "amazon": "url", etc.}
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chapbook saves table for user bookmarks
CREATE TABLE public.chapbook_saves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  chapbook_id UUID NOT NULL REFERENCES public.chapbooks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, chapbook_id)
);

-- Enable RLS
ALTER TABLE public.chapbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapbook_saves ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chapbooks
CREATE POLICY "Anyone can view approved chapbooks"
  ON public.chapbooks FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can view own submitted chapbooks"
  ON public.chapbooks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can submit chapbooks"
  ON public.chapbooks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chapbooks"
  ON public.chapbooks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chapbooks"
  ON public.chapbooks FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for chapbook saves
CREATE POLICY "Users can view own saves"
  ON public.chapbook_saves FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save chapbooks"
  ON public.chapbook_saves FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave chapbooks"
  ON public.chapbook_saves FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance with large datasets
CREATE INDEX idx_chapbooks_status ON public.chapbooks(status);
CREATE INDEX idx_chapbooks_genre ON public.chapbooks USING GIN(genre_tags);
CREATE INDEX idx_chapbooks_format ON public.chapbooks(format);
CREATE INDEX idx_chapbooks_price ON public.chapbooks(price);
CREATE INDEX idx_chapbooks_year ON public.chapbooks(year);
CREATE INDEX idx_chapbooks_country ON public.chapbooks(country);
CREATE INDEX idx_chapbooks_created ON public.chapbooks(created_at DESC);
CREATE INDEX idx_chapbooks_title_search ON public.chapbooks USING GIN(to_tsvector('english', title || ' ' || poet_name));

-- Trigger for updated_at
CREATE TRIGGER update_chapbooks_updated_at
  BEFORE UPDATE ON public.chapbooks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
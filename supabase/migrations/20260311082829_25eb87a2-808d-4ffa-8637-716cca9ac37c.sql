
-- Create tag_metadata table
CREATE TABLE public.tag_metadata (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tag TEXT NOT NULL UNIQUE,
  description TEXT,
  banner_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tag_metadata ENABLE ROW LEVEL SECURITY;

-- Public can read tag metadata
CREATE POLICY "Anyone can view tag metadata"
  ON public.tag_metadata FOR SELECT
  USING (true);

-- Only admins can insert
CREATE POLICY "Admins can insert tag metadata"
  ON public.tag_metadata FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update
CREATE POLICY "Admins can update tag metadata"
  ON public.tag_metadata FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete
CREATE POLICY "Admins can delete tag metadata"
  ON public.tag_metadata FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Auto-update updated_at
CREATE TRIGGER update_tag_metadata_updated_at
  BEFORE UPDATE ON public.tag_metadata
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for tag banners
INSERT INTO storage.buckets (id, name, public)
VALUES ('tag-banners', 'tag-banners', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for tag banners
CREATE POLICY "Tag banners are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tag-banners');

CREATE POLICY "Admins can upload tag banners"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'tag-banners' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update tag banners"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'tag-banners' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete tag banners"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'tag-banners' AND has_role(auth.uid(), 'admin'::app_role));

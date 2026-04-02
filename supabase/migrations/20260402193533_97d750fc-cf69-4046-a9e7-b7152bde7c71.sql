
-- Add image_url column to tag_metadata
ALTER TABLE public.tag_metadata ADD COLUMN IF NOT EXISTS image_url text;

-- Create tag-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('tag-images', 'tag-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access
CREATE POLICY "Anyone can view tag images"
ON storage.objects FOR SELECT
USING (bucket_id = 'tag-images');

-- Admin upload
CREATE POLICY "Admins can upload tag images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'tag-images' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Admin update
CREATE POLICY "Admins can update tag images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'tag-images' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Admin delete
CREATE POLICY "Admins can delete tag images"
ON storage.objects FOR DELETE
USING (bucket_id = 'tag-images' AND public.has_role(auth.uid(), 'admin'::public.app_role));

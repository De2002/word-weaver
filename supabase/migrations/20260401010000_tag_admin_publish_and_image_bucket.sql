-- Ensure tag metadata can be published by admins and tag images can be uploaded publicly.

-- Strengthen admin update policy to include WITH CHECK for updated rows.
DROP POLICY IF EXISTS "Admins can update tag metadata" ON public.tag_metadata;
CREATE POLICY "Admins can update tag metadata"
  ON public.tag_metadata FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for explore tag card images.
INSERT INTO storage.buckets (id, name, public)
VALUES ('tag-images', 'tag-images', true)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public;

-- Storage policies for tag images.
DROP POLICY IF EXISTS "Tag images are publicly accessible" ON storage.objects;
CREATE POLICY "Tag images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tag-images');

DROP POLICY IF EXISTS "Admins can upload tag images" ON storage.objects;
CREATE POLICY "Admins can upload tag images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'tag-images' AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update tag images" ON storage.objects;
CREATE POLICY "Admins can update tag images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'tag-images' AND has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (bucket_id = 'tag-images' AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete tag images" ON storage.objects;
CREATE POLICY "Admins can delete tag images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'tag-images' AND has_role(auth.uid(), 'admin'::app_role));

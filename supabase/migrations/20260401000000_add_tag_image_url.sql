-- Add image_url column to tag_metadata for category card thumbnails
-- This is separate from banner_url which is used for the tag page header

ALTER TABLE public.tag_metadata
ADD COLUMN IF NOT EXISTS image_url TEXT;

COMMENT ON COLUMN public.tag_metadata.image_url IS 'Thumbnail image URL for tag category cards (separate from banner_url for page headers)';

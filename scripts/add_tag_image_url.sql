-- Add image_url column to tag_metadata for category card thumbnails
-- This is separate from banner_url which is used for the tag page header

ALTER TABLE tag_metadata
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add a comment explaining the column
COMMENT ON COLUMN tag_metadata.image_url IS 'Thumbnail image URL for tag category cards (separate from banner_url for page headers)';

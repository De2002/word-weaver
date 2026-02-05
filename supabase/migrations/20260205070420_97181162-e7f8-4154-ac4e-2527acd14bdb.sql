-- Add slug column to poems table
ALTER TABLE public.poems ADD COLUMN slug TEXT;

-- Create unique index on slug (allows null for now, will backfill)
CREATE UNIQUE INDEX poems_slug_unique ON public.poems(slug) WHERE slug IS NOT NULL;

-- Create function to generate unique slug
CREATE OR REPLACE FUNCTION public.generate_poem_slug(title_input TEXT, exclude_poem_id UUID DEFAULT NULL)
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
  slug_exists BOOLEAN;
BEGIN
  -- Generate base slug from title
  base_slug := lower(trim(title_input));
  base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  -- If empty, use 'untitled'
  IF base_slug = '' OR base_slug IS NULL THEN
    base_slug := 'untitled';
  END IF;
  
  -- Truncate to reasonable length
  base_slug := left(base_slug, 80);
  
  final_slug := base_slug;
  
  -- Check if slug exists and increment if needed
  LOOP
    IF exclude_poem_id IS NULL THEN
      SELECT EXISTS(SELECT 1 FROM poems WHERE slug = final_slug) INTO slug_exists;
    ELSE
      SELECT EXISTS(SELECT 1 FROM poems WHERE slug = final_slug AND id != exclude_poem_id) INTO slug_exists;
    END IF;
    
    EXIT WHEN NOT slug_exists;
    
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Backfill existing poems with slugs (using their titles or 'poem-{id}' for untitled)
UPDATE public.poems 
SET slug = (
  SELECT public.generate_poem_slug(
    COALESCE(NULLIF(title, ''), 'poem'),
    id
  )
)
WHERE slug IS NULL;

-- Now make slug NOT NULL for future inserts
ALTER TABLE public.poems ALTER COLUMN slug SET NOT NULL;
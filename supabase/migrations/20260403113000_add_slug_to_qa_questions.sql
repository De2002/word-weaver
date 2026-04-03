-- Add slug column for SEO-friendly Q&A URLs
ALTER TABLE public.qa_questions
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Function to generate unique slug for Q&A question titles
CREATE OR REPLACE FUNCTION public.generate_qa_question_slug(
  title_input TEXT,
  exclude_question_id UUID DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
  slug_exists BOOLEAN;
BEGIN
  base_slug := lower(trim(title_input));
  base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);

  IF base_slug = '' OR base_slug IS NULL THEN
    base_slug := 'question';
  END IF;

  base_slug := left(base_slug, 80);
  final_slug := base_slug;

  LOOP
    IF exclude_question_id IS NULL THEN
      SELECT EXISTS(SELECT 1 FROM public.qa_questions WHERE slug = final_slug) INTO slug_exists;
    ELSE
      SELECT EXISTS(
        SELECT 1 FROM public.qa_questions WHERE slug = final_slug AND id != exclude_question_id
      ) INTO slug_exists;
    END IF;

    EXIT WHEN NOT slug_exists;
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  RETURN final_slug;
END;
$$;

-- Backfill slugs for existing rows
UPDATE public.qa_questions q
SET slug = public.generate_qa_question_slug(q.title, q.id)
WHERE q.slug IS NULL;

ALTER TABLE public.qa_questions
ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS qa_questions_slug_unique
ON public.qa_questions(slug);

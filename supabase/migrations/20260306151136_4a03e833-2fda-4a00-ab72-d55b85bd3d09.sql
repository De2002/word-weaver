
-- Add 'pro' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'pro';

-- Add header_image, about, and pinned_poem_id columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS header_image text,
  ADD COLUMN IF NOT EXISTS about text,
  ADD COLUMN IF NOT EXISTS pinned_poem_id uuid REFERENCES public.poems(id) ON DELETE SET NULL;

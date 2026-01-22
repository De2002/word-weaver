-- Allow reading profiles of users who have published poems (for displaying author info)
CREATE POLICY "Anyone can view profiles of published poets"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.poems 
    WHERE poems.user_id = profiles.user_id 
    AND poems.status = 'published'
  )
);
-- Fix the poem_reads INSERT policy to require poem_id matches an existing published poem
DROP POLICY "Anyone can record reads" ON public.poem_reads;
CREATE POLICY "Anyone can record reads for published poems" ON public.poem_reads 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.poems 
      WHERE poems.id = poem_id 
      AND poems.status = 'published'
    )
  );
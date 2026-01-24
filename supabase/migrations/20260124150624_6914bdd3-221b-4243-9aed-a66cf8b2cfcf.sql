-- Allow anyone (including unauthenticated users) to read published poems
CREATE POLICY "Anyone can read published poems"
ON public.poems
FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- Drop the old authenticated-only read policy since we have a more permissive one now
DROP POLICY IF EXISTS "Read published poems or own drafts" ON public.poems;

-- Create a new policy for authenticated users to also read their own drafts
CREATE POLICY "Authenticated users can read own drafts"
ON public.poems
FOR SELECT
TO authenticated
USING (auth.uid() = user_id AND status = 'draft');
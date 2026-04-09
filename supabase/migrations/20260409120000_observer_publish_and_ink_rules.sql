-- Allow Observer users to publish with a monthly quota, while keeping Lyric/Epic behavior
DROP POLICY IF EXISTS "Lyric or Epic users can create poems" ON public.poems;
DROP POLICY IF EXISTS "Observer, Lyric, or Epic users can create poems" ON public.poems;

CREATE POLICY "Observer, Lyric, or Epic users can create poems"
ON public.poems
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND (
    has_role(auth.uid(), 'observer'::app_role)
    OR has_role(auth.uid(), 'lyric'::app_role)
    OR has_role(auth.uid(), 'epic'::app_role)
  )
);

-- Quota check:
-- - Epic: unlimited
-- - Lyric: 100 / month
-- - Observer: 10 / month
CREATE OR REPLACE FUNCTION public.check_poem_quota(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    CASE
      WHEN EXISTS (SELECT 1 FROM user_roles WHERE user_id = _user_id AND role = 'epic') THEN true
      WHEN EXISTS (SELECT 1 FROM user_roles WHERE user_id = _user_id AND role = 'lyric') THEN
        (SELECT count(*) < 100
         FROM poems
         WHERE poems.user_id = _user_id
           AND poems.created_at >= date_trunc('month', now()))
      WHEN EXISTS (SELECT 1 FROM user_roles WHERE user_id = _user_id AND role = 'observer') THEN
        (SELECT count(*) < 10
         FROM poems
         WHERE poems.user_id = _user_id
           AND poems.created_at >= date_trunc('month', now()))
      ELSE false
    END
$$;

-- Observer poets should not receive ink.
DROP POLICY IF EXISTS "Authenticated users can pour ink" ON public.ink_transactions;
DROP POLICY IF EXISTS "Authenticated users can pour ink to Lyric or Epic poets" ON public.ink_transactions;

CREATE POLICY "Authenticated users can pour ink to Lyric or Epic poets"
ON public.ink_transactions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = from_user_id
  AND (
    has_role(to_user_id, 'lyric'::app_role)
    OR has_role(to_user_id, 'epic'::app_role)
  )
);

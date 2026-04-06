-- 1. Drop old poet-only INSERT policy on poems
DROP POLICY IF EXISTS "Poets can create poems" ON public.poems;

-- 2. Create new policy: Lyric or Epic can publish
CREATE POLICY "Lyric or Epic users can create poems"
ON public.poems
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND (
    has_role(auth.uid(), 'lyric'::app_role)
    OR has_role(auth.uid(), 'epic'::app_role)
  )
);

-- 3. Create function to check monthly poem quota for Lyric users
CREATE OR REPLACE FUNCTION public.check_poem_quota(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    CASE
      -- Epic users: unlimited
      WHEN EXISTS (SELECT 1 FROM user_roles WHERE user_id = _user_id AND role = 'epic') THEN true
      -- Lyric users: max 100 per calendar month
      WHEN EXISTS (SELECT 1 FROM user_roles WHERE user_id = _user_id AND role = 'lyric') THEN
        (SELECT count(*) < 100
         FROM poems
         WHERE poems.user_id = _user_id
           AND poems.created_at >= date_trunc('month', now()))
      -- Others: cannot publish
      ELSE false
    END
$$;

-- 4. Add locked_balance and available_balance to ink_wallets
ALTER TABLE public.ink_wallets
  ADD COLUMN IF NOT EXISTS locked_balance integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS available_balance integer NOT NULL DEFAULT 0;

-- 5. Create ad_revenue_pool table
CREATE TABLE IF NOT EXISTS public.ad_revenue_pool (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  period_id uuid REFERENCES public.payout_periods(id),
  total_amount numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ad_revenue_pool ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage ad revenue pool"
ON public.ad_revenue_pool
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view ad revenue pool"
ON public.ad_revenue_pool
FOR SELECT
USING (true);

-- 6. Trigger for updated_at on ad_revenue_pool
CREATE TRIGGER update_ad_revenue_pool_updated_at
BEFORE UPDATE ON public.ad_revenue_pool
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
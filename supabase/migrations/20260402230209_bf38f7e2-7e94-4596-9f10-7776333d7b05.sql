
-- Add lyric and epic to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'lyric';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'epic';

-- Ink wallets: one per user
CREATE TABLE public.ink_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  balance integer NOT NULL DEFAULT 0,
  total_received integer NOT NULL DEFAULT 0,
  total_poured integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ink_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet" ON public.ink_wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can upsert wallets" ON public.ink_wallets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "System can update wallets" ON public.ink_wallets FOR UPDATE USING (auth.uid() = user_id);

-- Payout periods
CREATE TABLE public.payout_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start date NOT NULL,
  period_end date NOT NULL,
  status text NOT NULL DEFAULT 'active',
  total_ink integer NOT NULL DEFAULT 0,
  pool_amount numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payout_periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view payout periods" ON public.payout_periods FOR SELECT USING (true);
CREATE POLICY "Admins can manage payout periods" ON public.payout_periods FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Ink transactions
CREATE TABLE public.ink_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL,
  to_user_id uuid NOT NULL,
  poem_id uuid REFERENCES public.poems(id) ON DELETE SET NULL,
  amount integer NOT NULL,
  period_id uuid REFERENCES public.payout_periods(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  note text
);
ALTER TABLE public.ink_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ink transactions" ON public.ink_transactions FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "Authenticated users can pour ink" ON public.ink_transactions FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- Poet pool: single running record per month
CREATE TABLE public.poet_pool (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id uuid REFERENCES public.payout_periods(id),
  total_amount numeric(12,2) NOT NULL DEFAULT 0,
  platform_share numeric(12,2) NOT NULL DEFAULT 0,
  poet_share numeric(12,2) NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.poet_pool ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view poet pool" ON public.poet_pool FOR SELECT USING (true);
CREATE POLICY "Admins can manage poet pool" ON public.poet_pool FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Subscription events (Paddle webhook log)
CREATE TABLE public.subscription_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paddle_event_id text,
  event_type text NOT NULL,
  customer_email text,
  user_id uuid,
  subscription_id text,
  price_id text,
  amount numeric(12,2),
  currency text DEFAULT 'USD',
  raw_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view subscription events" ON public.subscription_events FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "System can insert subscription events" ON public.subscription_events FOR INSERT WITH CHECK (true);

-- Create trigger for ink_wallets updated_at
CREATE TRIGGER update_ink_wallets_updated_at
  BEFORE UPDATE ON public.ink_wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

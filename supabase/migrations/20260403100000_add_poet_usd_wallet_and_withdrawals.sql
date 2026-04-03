CREATE TABLE public.poet_usd_wallets (
  user_id uuid PRIMARY KEY,
  balance_usd numeric(12,2) NOT NULL DEFAULT 0,
  threshold_usd numeric(12,2) NOT NULL DEFAULT 10,
  paypal_email text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.poet_usd_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own poet usd wallet"
ON public.poet_usd_wallets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own poet usd wallet"
ON public.poet_usd_wallets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own poet usd wallet"
ON public.poet_usd_wallets
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage poet usd wallets"
ON public.poet_usd_wallets
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_poet_usd_wallets_updated_at
BEFORE UPDATE ON public.poet_usd_wallets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.poet_withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount_usd numeric(12,2) NOT NULL,
  paypal_email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

ALTER TABLE public.poet_withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own withdrawal requests"
ON public.poet_withdrawal_requests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own withdrawal requests"
ON public.poet_withdrawal_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage withdrawal requests"
ON public.poet_withdrawal_requests
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

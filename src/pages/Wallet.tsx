import { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, Droplets, Wallet as WalletIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthProvider';
import { db } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';

type InkTransaction = {
  id: string;
  from_user_id: string;
  to_user_id: string;
  amount: number;
  note: string | null;
  created_at: string;
};

type InkWallet = {
  balance: number;
  total_received: number;
  total_poured: number;
};

type PoetUsdWallet = {
  user_id: string;
  balance_usd: number;
  threshold_usd: number;
  paypal_email: string | null;
};

export default function Wallet() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [wallet, setWallet] = useState<InkWallet | null>(null);
  const [poetWallet, setPoetWallet] = useState<PoetUsdWallet | null>(null);
  const [paypalEmail, setPaypalEmail] = useState('');
  const [savingPayment, setSavingPayment] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [transactions, setTransactions] = useState<InkTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    (async () => {
      const [walletRes, txnRes, poetWalletRes] = await Promise.all([
        db.from('ink_wallets').select('balance, total_received, total_poured').eq('user_id', user.id).maybeSingle(),
        db.from('ink_transactions').select('*').or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`).order('created_at', { ascending: false }).limit(50),
        db.from('poet_usd_wallets').select('user_id, balance_usd, threshold_usd, paypal_email').eq('user_id', user.id).maybeSingle(),
      ]);

      setWallet(walletRes.data ?? { balance: 0, total_received: 0, total_poured: 0 });
      setTransactions(txnRes.data ?? []);
      const poetWalletData = poetWalletRes.data ?? { user_id: user.id, balance_usd: 0, threshold_usd: 10, paypal_email: null };
      setPoetWallet(poetWalletData);
      setPaypalEmail(poetWalletData.paypal_email ?? '');
      setLoading(false);
    })();
  }, [user]);

  const getType = (txn: InkTransaction) =>
    txn.to_user_id === user?.id && txn.from_user_id !== user?.id
      ? 'received'
      : txn.from_user_id === user?.id && txn.to_user_id !== user?.id
      ? 'poured'
      : 'credit';

  const threshold = poetWallet?.threshold_usd ?? 10;
  const poetBalance = Number(poetWallet?.balance_usd ?? 0);
  const canWithdraw = poetBalance >= threshold;

  const handleSavePaymentDetails = async () => {
    if (!user) return;
    const trimmedEmail = paypalEmail.trim();
    setSavingPayment(true);

    const { error } = await db.from('poet_usd_wallets').upsert(
      {
        user_id: user.id,
        paypal_email: trimmedEmail || null,
      },
      { onConflict: 'user_id' },
    );

    setSavingPayment(false);

    if (error) {
      toast({ title: 'Could not save payment details', description: error.message, variant: 'destructive' });
      return;
    }

    setPoetWallet((prev) => ({
      user_id: user.id,
      balance_usd: prev?.balance_usd ?? 0,
      threshold_usd: prev?.threshold_usd ?? 10,
      paypal_email: trimmedEmail || null,
    }));
    toast({ title: 'Payment details saved', description: 'Your PayPal email has been updated.' });
  };

  const handleWithdraw = async () => {
    if (!user || !poetWallet) return;
    if (!canWithdraw) return;
    if (!poetWallet.paypal_email) {
      toast({ title: 'Add PayPal email first', description: 'Please add your PayPal email before requesting withdrawal.', variant: 'destructive' });
      return;
    }

    setWithdrawing(true);
    const { error } = await db.from('poet_withdrawal_requests').insert({
      user_id: user.id,
      amount_usd: poetBalance,
      paypal_email: poetWallet.paypal_email,
      status: 'pending',
    });
    setWithdrawing(false);

    if (error) {
      toast({ title: 'Withdrawal request failed', description: error.message, variant: 'destructive' });
      return;
    }

    toast({
      title: 'Withdrawal requested',
      description: 'Your request is pending review. Earnings continue to roll over until paid.',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="max-w-2xl mx-auto h-14 px-4 flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <WalletIcon className="h-4 w-4 text-primary" />
            <h1 className="text-base font-semibold">Wallet</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4 pb-24">
        {loading ? (
          <div className="grid sm:grid-cols-3 gap-3">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-3 gap-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Current ink</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold text-foreground">{wallet?.balance ?? 0} ink</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Poured ink</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold text-foreground">{wallet?.total_poured ?? 0} ink</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Earned ink</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold text-foreground">{wallet?.total_received ?? 0} ink</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Available USD balance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-3xl font-semibold text-foreground">${poetBalance.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This is your share from the poet pool, calculated from Earned ink only (ink received from other poets on you or your poems). If the ${threshold.toFixed(2)} threshold is not met yet, balance rolls over.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="paypal-email">
                    PayPal email
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      id="paypal-email"
                      type="email"
                      placeholder="you@example.com"
                      value={paypalEmail}
                      onChange={(event) => setPaypalEmail(event.target.value)}
                    />
                    <Button type="button" variant="secondary" onClick={handleSavePaymentDetails} disabled={savingPayment}>
                      {savingPayment ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Add your payment details so we can process payouts.</p>
                </div>

                {canWithdraw && (
                  <Button type="button" onClick={handleWithdraw} disabled={withdrawing}>
                    {withdrawing ? 'Requesting...' : 'Withdraw'}
                  </Button>
                )}
                {!canWithdraw && (
                  <p className="text-xs text-muted-foreground">
                    Withdraw becomes available once your balance reaches ${threshold.toFixed(2)}.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Transaction history</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {transactions.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">No transactions yet</p>
                )}
                {transactions.map((txn) => {
                  const type = getType(txn);
                  return (
                    <div key={txn.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                          {type === 'poured' ? (
                            <ArrowUpRight className="h-4 w-4 text-primary" />
                          ) : (
                            <ArrowDownLeft className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{txn.note || (type === 'poured' ? 'Poured ink' : 'Received ink')}</p>
                          <p className="text-xs text-muted-foreground">{new Date(txn.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="gap-1">
                        <Droplets className="h-3 w-3" />
                        {type === 'poured' ? '-' : '+'}{txn.amount}
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}

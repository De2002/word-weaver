import { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, Droplets, Wallet as WalletIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthProvider';
import { db } from '@/lib/db';

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

export default function Wallet() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [wallet, setWallet] = useState<InkWallet | null>(null);
  const [transactions, setTransactions] = useState<InkTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    (async () => {
      const [walletRes, txnRes] = await Promise.all([
        db.from('ink_wallets').select('balance, total_received, total_poured').eq('user_id', user.id).maybeSingle(),
        db.from('ink_transactions').select('*').or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`).order('created_at', { ascending: false }).limit(50),
      ]);

      setWallet(walletRes.data ?? { balance: 0, total_received: 0, total_poured: 0 });
      setTransactions(txnRes.data ?? []);
      setLoading(false);
    })();
  }, [user]);

  const getType = (txn: InkTransaction) =>
    txn.to_user_id === user?.id && txn.from_user_id !== user?.id
      ? 'received'
      : txn.from_user_id === user?.id && txn.to_user_id !== user?.id
      ? 'poured'
      : 'credit';

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
          <div className="grid sm:grid-cols-2 gap-3">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 gap-3">
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
            </div>

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

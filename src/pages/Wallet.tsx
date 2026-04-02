import { useMemo } from 'react';
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, Droplets, Wallet as WalletIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const mockTransactions = [
  { id: '1', type: 'received', amount: 25, note: 'Received on “Midnight Rain”', date: '2026-04-01T10:25:00Z' },
  { id: '2', type: 'poured', amount: 10, note: 'Poured on “Breathing Dust”', date: '2026-03-31T18:14:00Z' },
  { id: '3', type: 'received', amount: 40, note: 'Received on “Unsent Letter”', date: '2026-03-30T11:02:00Z' },
];

export default function Wallet() {
  const navigate = useNavigate();

  const { currentInk, pouredInk } = useMemo(() => {
    const received = mockTransactions
      .filter((txn) => txn.type === 'received')
      .reduce((sum, txn) => sum + txn.amount, 0);
    const poured = mockTransactions
      .filter((txn) => txn.type === 'poured')
      .reduce((sum, txn) => sum + txn.amount, 0);

    return {
      currentInk: received - poured,
      pouredInk: poured,
    };
  }, []);

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
        <div className="grid sm:grid-cols-2 gap-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Current ink</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-foreground">{currentInk} ink</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Poured ink</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-foreground">{pouredInk} ink</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transaction history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockTransactions.map((txn) => (
              <div key={txn.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                    {txn.type === 'received' ? (
                      <ArrowDownLeft className="h-4 w-4 text-primary" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{txn.note}</p>
                    <p className="text-xs text-muted-foreground">{new Date(txn.date).toLocaleString()}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Droplets className="h-3 w-3" />
                  {txn.type === 'received' ? '+' : '-'}{txn.amount}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

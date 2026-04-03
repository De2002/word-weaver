import { useEffect, useState } from 'react';
import { Droplets } from 'lucide-react';
import { db } from '@/lib/db';

export function PoetPoolBanner() {
  const [poolAmount, setPoolAmount] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split('T')[0];

      const { data } = await db
        .from('poet_pool')
        .select('poet_share, payout_periods!inner(period_start, status)')
        .eq('payout_periods.period_start', periodStart)
        .eq('payout_periods.status', 'active')
        .maybeSingle();

      if (data) {
        setPoolAmount(Number(data.poet_share));
      }
    })();
  }, []);

  if (poolAmount === null || poolAmount === 0) return null;

  return (
    <div className="mx-4 mb-3 rounded-xl border border-primary/20 bg-primary/5 p-3 flex items-center gap-3">
      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Droplets className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">Poet Pool This Month</p>
        <p className="text-sm font-semibold text-foreground">
          ${poolAmount.toFixed(2)}
        </p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, Loader2, ChevronDown } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import { useChallenges } from '@/hooks/useChallenges';
import { ChallengeCard } from '@/components/challenges/ChallengeCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const FILTERS = ['all', 'active', 'judging', 'closed'] as const;
type Filter = typeof FILTERS[number];

export default function Challenges() {
  useSEO({
    title: 'Poetry Challenges',
    description: 'Monthly poetry challenges for Pro poets. Compete, win prizes, and grow your audience.',
  });

  const [filter, setFilter] = useState<Filter>('all');
  const { data: challenges, isLoading } = useChallenges();

  const filtered = (challenges || []).filter(c =>
    filter === 'all' ? true : c.status === filter
  );

  const active = (challenges || []).filter(c => c.status === 'active');

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/10 via-background to-background px-4 pt-10 pb-8">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl font-bold tracking-tight mb-2"
          >
            Poetry Challenges
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground max-w-sm mx-auto text-sm"
          >
            Monthly competitions for Pro Poets. Submit your best work, compete for prizes, and earn community recognition.
          </motion.p>

          {active.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/15 border border-green-500/25 text-green-600 text-xs font-semibold"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              {active.length} challenge{active.length !== 1 ? 's' : ''} open now
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground"
          >
            <Crown className="h-3 w-3 text-amber-500" />
            <span>Pro Poets only · Monthly cadence · Admin-curated</span>
          </motion.div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border',
                filter === f
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Trophy className="h-10 w-10 text-muted-foreground/30 mb-4" />
            <p className="font-medium text-foreground">No challenges yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              {filter === 'all'
                ? 'New challenges are posted each month.'
                : `No ${filter} challenges right now.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((c, i) => (
              <ChallengeCard key={c.id} challenge={c} index={i} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

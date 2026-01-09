import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Sprout, ChevronRight } from 'lucide-react';
import { Poet } from '@/types/poem';
import { PoetCard } from './PoetCard';
import { cn } from '@/lib/utils';

interface DiscoverSectionProps {
  title: string;
  subtitle?: string;
  poets: Poet[];
  type: 'trending' | 'rising' | 'new';
}

const sectionConfig = {
  trending: {
    icon: Sparkles,
    gradient: 'from-primary to-warm-gold',
    bg: 'bg-secondary/50',
  },
  rising: {
    icon: TrendingUp,
    gradient: 'from-soft-coral to-primary',
    bg: 'bg-secondary/50',
  },
  new: {
    icon: Sprout,
    gradient: 'from-sage to-sage',
    bg: 'bg-secondary/50',
  },
};

export function DiscoverSection({ title, subtitle, poets, type }: DiscoverSectionProps) {
  const config = sectionConfig[type];
  const Icon = config.icon;

  return (
    <section className="space-y-3">
      <motion.div 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between px-4"
      >
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-1.5 rounded-lg bg-gradient-to-r",
            config.gradient
          )}>
            <Icon className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{title}</h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        <button className="flex items-center gap-1 text-xs text-primary font-medium hover:underline">
          See all
          <ChevronRight className="h-3 w-3" />
        </button>
      </motion.div>

      <div className={cn(
        "flex overflow-x-auto scrollbar-hide py-2 px-2",
        config.bg,
        "rounded-xl mx-2"
      )}>
        {poets.map((poet, index) => (
          <PoetCard key={poet.id} poet={poet} index={index} variant="compact" />
        ))}
        {poets.length < 4 && [...Array(4 - poets.length)].map((_, i) => (
          <div key={`placeholder-${i}`} className="min-w-[100px]" />
        ))}
      </div>
    </section>
  );
}

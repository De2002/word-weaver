import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  progress: number;
}

export function PullToRefreshIndicator({
  pullDistance,
  isRefreshing,
  progress,
}: PullToRefreshIndicatorProps) {
  if (pullDistance <= 0 && !isRefreshing) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: pullDistance > 10 || isRefreshing ? 1 : 0,
        y: Math.min(pullDistance, 60),
      }}
      className="absolute left-0 right-0 top-0 flex justify-center pointer-events-none z-30"
    >
      <div className={cn(
        "flex items-center justify-center w-10 h-10 rounded-full bg-background border shadow-lg",
        isRefreshing && "border-primary"
      )}>
        <motion.div
          animate={isRefreshing ? { rotate: 360 } : { rotate: progress * 180 }}
          transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 0 }}
        >
          <RefreshCw 
            className={cn(
              "w-5 h-5 transition-colors",
              progress >= 1 || isRefreshing ? "text-primary" : "text-muted-foreground"
            )} 
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Calendar, Clock, Crown, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Challenge } from '@/hooks/useChallenges';
import { formatDistanceToNow, format, isPast } from 'date-fns';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  active: { label: 'Open', className: 'bg-green-500/15 text-green-600 border-green-500/25' },
  judging: { label: 'Judging', className: 'bg-amber-500/15 text-amber-600 border-amber-500/25' },
  closed: { label: 'Closed', className: 'bg-muted text-muted-foreground border-border' },
  draft: { label: 'Draft', className: 'bg-secondary text-muted-foreground border-border' },
};

interface ChallengeCardProps {
  challenge: Challenge;
  index?: number;
}

export function ChallengeCard({ challenge, index = 0 }: ChallengeCardProps) {
  const statusStyle = STATUS_STYLES[challenge.status] || STATUS_STYLES.closed;
  const deadline = new Date(challenge.end_date);
  const isExpired = isPast(deadline);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
    >
      <Link
        to={`/challenges/${challenge.id}`}
        className="group block rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-200"
      >
        {/* Cover / gradient header */}
        <div
          className="relative h-32 w-full overflow-hidden"
          style={{
            background: challenge.cover_url
              ? `url(${challenge.cover_url}) center/cover no-repeat`
              : 'linear-gradient(135deg, hsl(var(--primary)/0.15), hsl(var(--primary)/0.05))',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/80" />
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <Badge className={cn('text-[10px] font-semibold border', statusStyle.className)}>
              {statusStyle.label}
            </Badge>
            {challenge.prize_description && (
              <Badge className="text-[10px] bg-amber-500/15 text-amber-600 border-amber-500/25 gap-1">
                <Trophy className="h-2.5 w-2.5" />
                Prize
              </Badge>
            )}
          </div>
          <div className="absolute bottom-3 right-3">
            <div className="h-8 w-8 rounded-full bg-background/80 flex items-center justify-center">
              <Crown className="h-4 w-4 text-primary" />
            </div>
          </div>
        </div>

        <div className="p-4 space-y-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              {challenge.month}
            </p>
            <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {challenge.title}
            </h3>
          </div>

          {challenge.theme && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              Theme: <span className="text-foreground font-medium">{challenge.theme}</span>
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(challenge.start_date), 'MMM d')}
              {' – '}
              {format(deadline, 'MMM d, yyyy')}
            </span>
            {!isExpired && challenge.status === 'active' && (
              <span className="flex items-center gap-1 text-primary font-medium">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(deadline, { addSuffix: true })}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, Sprout } from 'lucide-react';
import { Poet } from '@/types/poem';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FollowButton } from '@/components/FollowButton';
import { cn } from '@/lib/utils';

interface PoetCardProps {
  poet: Poet;
  index?: number;
  variant?: 'compact' | 'full';
}

export function PoetCard({ poet, index = 0, variant = 'compact' }: PoetCardProps) {
  const badge = poet.badges[0];

  const BadgeIcon = badge?.type === 'trending' 
    ? Sparkles 
    : badge?.type === 'rising' 
      ? TrendingUp 
      : Sprout;

  if (variant === 'compact') {
    return (
      <Link to={`/poet/${poet.username}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          className="flex flex-col items-center gap-2 p-4 min-w-[100px] cursor-pointer group"
        >
          <div className="relative">
            <Avatar className="h-16 w-16 ring-2 ring-border group-hover:ring-primary transition-all">
              <AvatarImage src={poet.avatar} alt={poet.name} />
              <AvatarFallback className="bg-secondary text-lg font-medium">
                {poet.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {badge && (
              <div className={cn(
                "absolute -bottom-1 -right-1 p-1 rounded-full",
                badge.type === 'trending' && "bg-gradient-to-r from-primary to-warm-gold",
                badge.type === 'new' && "bg-sage",
                badge.type === 'rising' && "bg-soft-coral",
              )}>
                <BadgeIcon className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          <div className="text-center">
            <p className="text-sm font-medium truncate max-w-[90px]">{poet.name}</p>
            <p className="text-xs text-muted-foreground">@{poet.username}</p>
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link to={`/poet/${poet.username}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.4 }}
        className="card-poem p-4 flex items-start gap-3 cursor-pointer hover:shadow-elevated transition-shadow"
      >
        <div className="relative">
          <Avatar className="h-12 w-12 ring-2 ring-border">
            <AvatarImage src={poet.avatar} alt={poet.name} />
            <AvatarFallback className="bg-secondary font-medium">
              {poet.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {badge && (
            <div className={cn(
              "absolute -bottom-1 -right-1 p-1 rounded-full",
              badge.type === 'trending' && "bg-gradient-to-r from-primary to-warm-gold",
              badge.type === 'new' && "bg-sage",
              badge.type === 'rising' && "bg-soft-coral",
            )}>
              <BadgeIcon className="h-2.5 w-2.5 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{poet.name}</span>
            {badge && (
              <span className={cn(
                "text-xs shrink-0",
                badge.type === 'trending' && 'badge-trending',
                badge.type === 'new' && 'badge-new',
                badge.type === 'rising' && 'badge-rising',
              )}>
                {badge.label}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">@{poet.username}</p>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{poet.bio}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span>{poet.totalPoems} poems</span>
            <span>·</span>
            <span>{(poet.totalReads / 1000).toFixed(1)}k reads</span>
          </div>
        </div>
        <FollowButton poetUserId={poet.id} variant="compact" />
      </motion.div>
    </Link>
  );
}

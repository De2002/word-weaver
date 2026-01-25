import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Introduction, ReactionEmoji } from '@/types/introduction';
import { useAuth } from '@/context/AuthProvider';
import { cn } from '@/lib/utils';

const REACTIONS: { emoji: ReactionEmoji; label: string }[] = [
  { emoji: '👋', label: 'Wave' },
  { emoji: '🎉', label: 'Celebrate' },
  { emoji: '❤️', label: 'Love' },
];

interface IntroductionCardProps {
  introduction: Introduction;
  onReact: (emoji: ReactionEmoji) => void;
}

export function IntroductionCard({ introduction, onReact }: IntroductionCardProps) {
  const { user } = useAuth();
  const displayName = introduction.profile?.display_name || introduction.profile?.username || 'Poet';
  const initials = displayName.slice(0, 2).toUpperCase();
  const timeAgo = formatDistanceToNow(new Date(introduction.created_at), { addSuffix: true });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border rounded-xl p-4 md:p-5"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Link to={`/poet/${introduction.user_id}`}>
          <Avatar className="h-10 w-10 md:h-12 md:w-12 ring-2 ring-primary/10">
            <AvatarImage src={introduction.profile?.avatar_url || ''} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/poet/${introduction.user_id}`} className="hover:underline">
            <h3 className="font-medium text-foreground truncate">{displayName}</h3>
          </Link>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>
      </div>

      {/* Content */}
      <p className="text-foreground leading-relaxed whitespace-pre-wrap mb-4">
        {introduction.content}
      </p>

      {/* Reactions */}
      <div className="flex items-center gap-2 flex-wrap">
        {REACTIONS.map(({ emoji, label }) => {
          const reactionData = introduction.reactions?.find(r => r.emoji === emoji);
          const count = reactionData?.count || 0;
          const hasReacted = introduction.userReactions?.includes(emoji);

          return (
            <Button
              key={emoji}
              variant={hasReacted ? 'secondary' : 'outline'}
              size="sm"
              className={cn(
                'h-8 px-3 gap-1.5 text-base transition-all',
                hasReacted && 'bg-primary/10 border-primary/30 hover:bg-primary/20'
              )}
              onClick={() => user && onReact(emoji)}
              disabled={!user}
              title={user ? label : 'Log in to react'}
            >
              <span>{emoji}</span>
              {count > 0 && <span className="text-xs font-medium">{count}</span>}
            </Button>
          );
        })}
      </div>
    </motion.div>
  );
}

import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Heart, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Journal } from '@/types/journal';
import { cn } from '@/lib/utils';

interface JournalCardProps {
  journal: Journal;
}

export function JournalCard({ journal }: JournalCardProps) {
  const displayName = journal.profile?.display_name || 'Anonymous';
  const username = journal.profile?.username;
  const avatarUrl = journal.profile?.avatar_url;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <Link 
      to={`/journals/${journal.id}`}
      className="block group"
    >
      <article className="py-6 border-b border-border/50 transition-colors hover:bg-muted/30">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatarUrl || undefined} alt={displayName} />
              <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Title */}
            <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 font-poem">
              {journal.title}
            </h2>

            {/* Excerpt */}
            {journal.excerpt && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {journal.excerpt}
              </p>
            )}

            {/* Meta row */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
              {/* Author & Date */}
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-foreground/80">{displayName}</span>
                {username && (
                  <span className="text-muted-foreground">@{username}</span>
                )}
                <span className="text-muted-foreground/50">·</span>
                <time dateTime={journal.created_at}>
                  {format(new Date(journal.created_at), 'MMM d, yyyy')}
                </time>
              </div>

              {/* Engagement */}
              <div className="flex items-center gap-3 ml-auto">
                <div className={cn(
                  "flex items-center gap-1",
                  journal.is_liked && "text-destructive"
                )}>
                  <Heart className={cn("h-3.5 w-3.5", journal.is_liked && "fill-current")} />
                  <span>{journal.likes_count || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>{journal.comments_count || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

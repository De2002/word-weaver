import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Bookmark, Share2, Sparkles } from 'lucide-react';
import { Poem } from '@/types/poem';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PoemCardProps {
  poem: Poem;
  index?: number;
}

export function PoemCard({ poem, index = 0 }: PoemCardProps) {
  const [isUpvoted, setIsUpvoted] = useState(poem.isUpvoted);
  const [isSaved, setIsSaved] = useState(poem.isSaved);
  const [upvotes, setUpvotes] = useState(poem.upvotes);
  const [isExpanded, setIsExpanded] = useState(false);

  const poemLines = poem.text.split('\n');
  const shouldTruncate = poemLines.length > 12;
  const displayText = shouldTruncate && !isExpanded 
    ? poemLines.slice(0, 10).join('\n') 
    : poem.text;

  const handleUpvote = () => {
    setIsUpvoted(!isUpvoted);
    setUpvotes(prev => isUpvoted ? prev - 1 : prev + 1);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const poetBadge = poem.poet.badges[0];

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="card-poem p-5 md:p-6 space-y-4"
    >
      {/* Poet Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-border">
            <AvatarImage src={poem.poet.avatar} alt={poem.poet.name} />
            <AvatarFallback className="bg-secondary font-medium">
              {poem.poet.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{poem.poet.name}</span>
              {poetBadge && (
                <span className={cn(
                  poetBadge.type === 'trending' && 'badge-trending',
                  poetBadge.type === 'new' && 'badge-new',
                  poetBadge.type === 'rising' && 'badge-rising',
                )}>
                  {poetBadge.type === 'trending' && <Sparkles className="h-3 w-3" />}
                  {poetBadge.label}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">@{poem.poet.username}</span>
          </div>
        </div>
        <button className="text-xs text-primary font-medium hover:underline">
          Follow
        </button>
      </header>

      {/* Poem Content */}
      <div className="space-y-3">
        {poem.title && (
          <h2 className="poem-title text-foreground">{poem.title}</h2>
        )}
        
        <div className="poem-text text-foreground/90 whitespace-pre-line">
          {displayText}
        </div>

        {shouldTruncate && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="text-sm text-primary font-medium hover:underline"
          >
            Read more...
          </button>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {poem.tags.slice(0, 4).map(tag => (
          <Badge 
            key={tag} 
            variant="secondary"
            className="text-xs font-normal px-2 py-0.5"
          >
            #{tag}
          </Badge>
        ))}
      </div>

      {/* Actions */}
      <footer className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleUpvote}
            className={cn(
              "flex items-center gap-1.5 text-sm transition-colors",
              isUpvoted ? "text-soft-coral" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Heart 
              className={cn("h-5 w-5", isUpvoted && "fill-current")} 
            />
            <span>{upvotes}</span>
          </motion.button>

          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <MessageCircle className="h-5 w-5" />
            <span>{poem.comments}</span>
          </button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSave}
            className={cn(
              "flex items-center gap-1.5 text-sm transition-colors",
              isSaved ? "text-warm-gold" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Bookmark 
              className={cn("h-5 w-5", isSaved && "fill-current")} 
            />
            <span>{poem.saves}</span>
          </motion.button>
        </div>

        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <Share2 className="h-5 w-5" />
        </button>
      </footer>
    </motion.article>
  );
}

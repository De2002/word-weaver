import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Bookmark, Share2, Sparkles, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { Poem } from '@/types/poem';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TagBadge } from '@/components/TagBadge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  text: string;
  createdAt: string;
  likes: number;
}

interface PoemCardProps {
  poem: Poem;
  index?: number;
}

export function PoemCard({ poem, index = 0 }: PoemCardProps) {
  const navigate = useNavigate();
  const [isUpvoted, setIsUpvoted] = useState(poem.isUpvoted);
  const [isSaved, setIsSaved] = useState(poem.isSaved);
  const [upvotes, setUpvotes] = useState(poem.upvotes);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: {
        name: 'Maya Thompson',
        username: 'mayapoetry',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      },
      text: 'This touched my soul. Beautiful words.',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      likes: 5,
    },
  ]);

  const poemLines = poem.text.split('\n');
  const shouldTruncate = poemLines.length > 8;
  const displayText = shouldTruncate && !isExpanded 
    ? poemLines.slice(0, 6).join('\n') 
    : poem.text;

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUpvoted(!isUpvoted);
    setUpvotes(prev => isUpvoted ? prev - 1 : prev + 1);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  const handleToggleComments = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowComments(!showComments);
  };

  const handleSubmitComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!commentText.trim()) return;
    
    const newComment: Comment = {
      id: Date.now().toString(),
      author: {
        name: 'You',
        username: 'you',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
      },
      text: commentText,
      createdAt: new Date().toISOString(),
      likes: 0,
    };
    
    setComments([newComment, ...comments]);
    setCommentText('');
  };

  const handleReadMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsExpanded(!isExpanded);
  };

  const handlePoemClick = () => {
    navigate(`/poem/${poem.id}`);
  };

  const poetBadge = poem.poet.badges[0];

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="bg-card border-b border-border/50 p-5 md:p-6"
    >
      {/* Poet Header */}
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 ring-2 ring-border">
            <AvatarImage src={poem.poet.avatar} alt={poem.poet.name} />
            <AvatarFallback className="bg-secondary font-medium">
              {poem.poet.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{poem.poet.name}</span>
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
            <span className="text-sm text-muted-foreground">@{poem.poet.username}</span>
          </div>
        </div>
        <button 
          className="text-sm text-primary font-medium hover:underline px-3 py-1.5 rounded-full border border-primary/30 hover:bg-primary/5 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          Follow
        </button>
      </header>

      {/* Poem Content - Clickable */}
      <div 
        onClick={handlePoemClick}
        className="cursor-pointer space-y-3 mb-4"
      >
        {poem.title && (
          <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground">
            {poem.title}
          </h2>
        )}
        
        <div className="font-serif text-lg leading-relaxed text-foreground whitespace-pre-line">
          {displayText}
        </div>

        {shouldTruncate && (
          <motion.button
            onClick={handleReadMore}
            className="flex items-center gap-1 text-sm text-primary font-medium hover:underline mt-2"
            whileTap={{ scale: 0.98 }}
          >
            {isExpanded ? (
              <>
                <span>Show less</span>
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                <span>Read more</span>
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </motion.button>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {poem.tags.slice(0, 4).map(tag => (
          <TagBadge key={tag} tag={tag} />
        ))}
      </div>

      {/* Meta Info */}
      <div className="text-sm text-muted-foreground mb-4">
        <span>{poem.reads?.toLocaleString() || 0} reads</span>
        <span className="mx-2">·</span>
        <span>{formatDistanceToNow(new Date(poem.createdAt), { addSuffix: true })}</span>
      </div>

      <Separator className="mb-4" />

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleUpvote}
            className={cn(
              "flex items-center gap-2 transition-colors",
              isUpvoted ? "text-soft-coral" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Heart 
              className={cn("h-5 w-5", isUpvoted && "fill-current")} 
            />
            <span className="font-medium text-sm">{upvotes}</span>
          </motion.button>

          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleComments}
            className={cn(
              "flex items-center gap-2 transition-colors",
              showComments ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MessageCircle className={cn("h-5 w-5", showComments && "fill-primary/20")} />
            <span className="font-medium text-sm">{poem.comments + comments.length - 1}</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSave}
            className={cn(
              "flex items-center gap-2 transition-colors",
              isSaved ? "text-warm-gold" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Bookmark 
              className={cn("h-5 w-5", isSaved && "fill-current")} 
            />
            <span className="font-medium text-sm">{poem.saves}</span>
          </motion.button>
        </div>

        <button 
          className="text-muted-foreground hover:text-foreground transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <Share2 className="h-5 w-5" />
        </button>
      </div>

      {/* Inline Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Separator className="my-4" />
            
            {/* Comment Input */}
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face" />
                <AvatarFallback>Y</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex items-center gap-2">
                <Input
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.stopPropagation();
                      handleSubmitComment(e as any);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 bg-secondary/50 border-0 h-9 text-sm"
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim()}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    commentText.trim() 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  <Send className="h-4 w-4" />
                </motion.button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-3">
              {comments.slice(0, 3).map((comment, idx) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex gap-3"
                >
                  <Avatar className="h-7 w-7 flex-shrink-0">
                    <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                    <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground">{comment.author.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90">{comment.text}</p>
                    <div className="flex items-center gap-4 pt-1">
                      <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <Heart className="h-3 w-3" />
                        <span>{comment.likes}</span>
                      </button>
                      <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                        Reply
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {comments.length > 3 && (
                <button 
                  onClick={handlePoemClick}
                  className="text-sm text-primary font-medium hover:underline"
                >
                  View all {comments.length} comments
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

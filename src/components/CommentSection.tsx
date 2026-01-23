import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Send, Trash2, CornerDownRight, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useComments, Comment } from '@/hooks/useComments';
import { useAuth } from '@/context/AuthProvider';

interface CommentSectionProps {
  poemId: string;
  onViewAll?: () => void;
  maxComments?: number;
}

interface CommentItemProps {
  comment: Comment;
  onLike: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  onReply: (parentId: string) => void;
  currentUserId?: string;
  depth?: number;
}

function CommentItem({ comment, onLike, onDelete, onReply, currentUserId, depth = 0 }: CommentItemProps) {
  const isOwner = currentUserId === comment.userId;
  const maxDepth = 2; // Limit nesting depth

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3", depth > 0 && "ml-8 mt-2")}
    >
      <Link to={`/poet/${comment.author.username}`} onClick={(e) => e.stopPropagation()}>
        <Avatar className={cn("flex-shrink-0", depth === 0 ? "h-8 w-8" : "h-6 w-6")}>
          <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
          <AvatarFallback className="text-xs">{comment.author.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link 
            to={`/poet/${comment.author.username}`} 
            className="font-medium text-sm text-foreground hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {comment.author.name}
          </Link>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm text-foreground/90 mt-0.5 break-words">{comment.content}</p>
        <div className="flex items-center gap-4 pt-1.5">
          <button 
            onClick={(e) => { e.stopPropagation(); onLike(comment.id); }}
            className={cn(
              "flex items-center gap-1 text-xs transition-colors",
              comment.isLiked ? "text-soft-coral" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Heart className={cn("h-3 w-3", comment.isLiked && "fill-current")} />
            <span>{comment.likeCount}</span>
          </button>
          {depth < maxDepth && (
            <button 
              onClick={(e) => { e.stopPropagation(); onReply(comment.id); }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Reply
            </button>
          )}
          {isOwner && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(comment.id); }}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Replies */}
        {comment.replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onLike={onLike}
                onDelete={onDelete}
                onReply={onReply}
                currentUserId={currentUserId}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function CommentSection({ poemId, onViewAll, maxComments = 3 }: CommentSectionProps) {
  const { session } = useAuth();
  const { comments, commentCount, isLoading, addComment, deleteComment, toggleLike, isAddingComment } = useComments(poemId);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  
  const userProfile = session?.user;
  const userAvatar = ''; // Will be fetched from profile in real implementation

  const handleSubmit = (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.stopPropagation();
    if (!commentText.trim()) return;
    
    addComment(commentText.trim(), replyingTo || undefined);
    setCommentText('');
    setReplyingTo(null);
  };

  const handleReply = (parentId: string) => {
    setReplyingTo(parentId);
    // Find the comment to show who we're replying to
    const parent = comments.find(c => c.id === parentId) || 
                   comments.flatMap(c => c.replies).find(r => r.id === parentId);
    if (parent) {
      setCommentText(`@${parent.author.username} `);
    }
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setCommentText('');
  };

  const displayedComments = comments.slice(0, maxComments);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <Separator className="my-4" />
      
      {/* Reply indicator */}
      {replyingTo && (
        <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
          <CornerDownRight className="h-3 w-3" />
          <span>Replying to comment</span>
          <button 
            onClick={(e) => { e.stopPropagation(); handleCancelReply(); }}
            className="text-primary hover:underline"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Comment Input */}
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="h-8 w-8">
          <AvatarImage src={userAvatar} />
          <AvatarFallback className="text-xs bg-secondary">
            {userProfile?.email?.charAt(0).toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 flex items-center gap-2">
          <Input
            placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 bg-secondary/50 border-0 h-9 text-sm"
            maxLength={1000}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSubmit}
            disabled={!commentText.trim() || isAddingComment}
            className={cn(
              "p-2 rounded-full transition-colors",
              commentText.trim() && !isAddingComment
                ? "bg-primary text-primary-foreground" 
                : "bg-secondary text-muted-foreground"
            )}
          >
            {isAddingComment ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Comments List */}
      {!isLoading && (
        <div className="space-y-4">
          <AnimatePresence>
            {displayedComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onLike={toggleLike}
                onDelete={deleteComment}
                onReply={handleReply}
                currentUserId={session?.user?.id}
              />
            ))}
          </AnimatePresence>
          
          {comments.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">
              No comments yet. Be the first to share your thoughts!
            </p>
          )}

          {commentCount > maxComments && onViewAll && (
            <button 
              onClick={(e) => { e.stopPropagation(); onViewAll(); }}
              className="text-sm text-primary font-medium hover:underline"
            >
              View all {commentCount} comments
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

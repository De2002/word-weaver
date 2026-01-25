import { useState } from 'react';
import { format } from 'date-fns';
import { Trash2, Send, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthProvider';
import { useJournalComments, useAddJournalComment, useDeleteJournalComment } from '@/hooks/useJournals';
import { JournalComment } from '@/types/journal';
import { Link } from 'react-router-dom';

interface JournalCommentSectionProps {
  journalId: string;
}

export function JournalCommentSection({ journalId }: JournalCommentSectionProps) {
  const { user } = useAuth();
  const { data: comments = [], isLoading } = useJournalComments(journalId);
  const addComment = useAddJournalComment();
  const deleteComment = useDeleteJournalComment();
  const [newComment, setNewComment] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    await addComment.mutateAsync({ journalId, content: newComment.trim() });
    setNewComment('');
  };

  const handleDelete = async (commentId: string) => {
    await deleteComment.mutateAsync({ commentId, journalId });
  };

  return (
    <section className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">
        Comments ({comments.length})
      </h3>

      {/* Add comment form */}
      {user ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            placeholder="Share your thoughts..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px] resize-none bg-muted/30 border-border/50 focus:bg-background"
          />
          <div className="flex justify-end">
            <Button 
              type="submit" 
              size="sm"
              disabled={!newComment.trim() || addComment.isPending}
              className="gap-2"
            >
              {addComment.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Post
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground py-4 text-center bg-muted/30 rounded-lg">
          <Link to="/login" className="text-primary hover:underline">Sign in</Link> to leave a comment
        </p>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No comments yet. Be the first to share your thoughts.
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              canDelete={user?.id === comment.user_id}
              onDelete={() => handleDelete(comment.id)}
              isDeleting={deleteComment.isPending}
            />
          ))
        )}
      </div>
    </section>
  );
}

interface CommentItemProps {
  comment: JournalComment;
  canDelete: boolean;
  onDelete: () => void;
  isDeleting: boolean;
}

function CommentItem({ comment, canDelete, onDelete, isDeleting }: CommentItemProps) {
  const displayName = comment.profile?.display_name || 'Anonymous';
  const username = comment.profile?.username;
  const avatarUrl = comment.profile?.avatar_url;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="flex gap-3 py-3">
      <Link to={username ? `/poet/${username}` : '#'}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={avatarUrl || undefined} alt={displayName} />
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <Link 
            to={username ? `/poet/${username}` : '#'}
            className="text-sm font-medium text-foreground hover:underline"
          >
            {displayName}
          </Link>
          <span className="text-xs text-muted-foreground">
            {format(new Date(comment.created_at), 'MMM d, yyyy')}
          </span>
          {canDelete && (
            <button
              onClick={onDelete}
              disabled={isDeleting}
              className="ml-auto p-1 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {comment.content}
        </p>
      </div>
    </div>
  );
}

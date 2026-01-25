import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ArrowLeft, Heart, Loader2, Edit, Trash2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { JournalCommentSection } from '@/components/journals/JournalCommentSection';
import { MarkdownRenderer } from '@/components/journals/MarkdownRenderer';
import { useJournal, useLikeJournal, useDeleteJournal } from '@/hooks/useJournals';
import { useAuth } from '@/context/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function JournalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: journal, isLoading, error } = useJournal(id || '');
  const likeJournal = useLikeJournal();
  const deleteJournal = useDeleteJournal();

  const isOwner = user?.id === journal?.user_id;
  const displayName = journal?.profile?.display_name || 'Anonymous';
  const username = journal?.profile?.username;
  const avatarUrl = journal?.profile?.avatar_url;
  const initials = displayName.slice(0, 2).toUpperCase();

  // Update document title
  useEffect(() => {
    if (journal) {
      document.title = `${journal.title} by ${displayName} | WordStack`;
    }
    return () => {
      document.title = 'WordStack';
    };
  }, [journal, displayName]);

  const handleLike = () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to like journals.',
      });
      return;
    }
    if (!journal) return;
    likeJournal.mutate({ journalId: journal.id, isLiked: journal.is_liked || false });
  };

  const handleDelete = async () => {
    if (!journal) return;
    try {
      await deleteJournal.mutateAsync(journal.id);
      toast({ title: 'Journal deleted' });
      navigate('/journals');
    } catch {
      toast({ title: 'Failed to delete journal', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !journal) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <p className="text-muted-foreground">Journal not found.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/journals">Back to Journals</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 pt-20 pb-24">
        {/* Back button */}
        <Link 
          to="/journals" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Journals
        </Link>

        <motion.article
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <header className="space-y-6">
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground font-poem leading-tight">
              {journal.title}
            </h1>

            {/* Author info */}
            <div className="flex items-center justify-between">
              <Link 
                to={username ? `/poet/${username}` : '#'}
                className="flex items-center gap-3 group"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {displayName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(journal.created_at), 'MMMM d, yyyy')}
                  </p>
                </div>
              </Link>

              {/* Owner actions */}
              {isOwner && (
                <div className="flex items-center gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link to={`/journals/${journal.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Journal</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your journal.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <MarkdownRenderer content={journal.content} />
          </div>

          {/* Like button */}
          <div className="flex items-center gap-4 pt-4 border-t border-border/50">
            <button
              onClick={handleLike}
              disabled={likeJournal.isPending}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full transition-colors",
                journal.is_liked 
                  ? "bg-destructive/10 text-destructive" 
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              )}
            >
              <Heart className={cn("h-5 w-5", journal.is_liked && "fill-current")} />
              <span className="text-sm font-medium">{journal.likes_count || 0}</span>
            </button>
          </div>

          {/* Comments */}
          <div className="pt-8 border-t border-border/50">
            <JournalCommentSection journalId={journal.id} />
          </div>
        </motion.article>
      </main>
    </div>
  );
}

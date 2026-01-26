import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Send, Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MarkdownEditor } from '@/components/journals/MarkdownEditor';
import { useJournal, useUpdateJournal } from '@/hooks/useJournals';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthProvider';
import { useSEO } from '@/hooks/useSEO';

export default function EditJournal() {
  useSEO({
    title: "Edit Journal",
    description: "Edit your journal entry on WordStack."
  });
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: journal, isLoading } = useJournal(id || '');
  const updateJournal = useUpdateJournal();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');

  useEffect(() => {
    if (journal) {
      setTitle(journal.title);
      setContent(journal.content);
      setExcerpt(journal.excerpt || '');
    }
  }, [journal]);

  // Check ownership
  useEffect(() => {
    if (journal && user && journal.user_id !== user.id) {
      navigate('/journals');
    }
  }, [journal, user, navigate]);

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!title.trim()) {
      toast({ title: 'Please enter a title', variant: 'destructive' });
      return;
    }
    if (!content.trim()) {
      toast({ title: 'Please enter content', variant: 'destructive' });
      return;
    }

    try {
      await updateJournal.mutateAsync({
        id: id!,
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || content.substring(0, 200),
        status,
      });
      
      toast({ 
        title: status === 'published' ? 'Journal updated!' : 'Draft saved',
      });
      navigate(`/journals/${id}`);
    } catch {
      toast({ title: 'Failed to update journal', variant: 'destructive' });
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

  if (!journal) {
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
          to={`/journals/${id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Journal
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-3xl font-semibold text-foreground font-poem mb-2">
              Edit Journal
            </h1>
          </div>

          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Give your journal a title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-medium"
              />
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">
                Excerpt <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                id="excerpt"
                placeholder="A brief summary that appears in the feed..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="min-h-[80px] resize-none"
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground text-right">
                {excerpt.length}/200
              </p>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <MarkdownEditor
                value={content}
                onChange={setContent}
                placeholder="Write your journal entry... Use markdown for formatting."
                minHeight="400px"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => handleSubmit('draft')}
                disabled={updateJournal.isPending}
                className="gap-2"
              >
                {updateJournal.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save as Draft
              </Button>
              <Button
                onClick={() => handleSubmit('published')}
                disabled={updateJournal.isPending}
                className="gap-2"
              >
                {updateJournal.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {journal.status === 'published' ? 'Update' : 'Publish'}
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

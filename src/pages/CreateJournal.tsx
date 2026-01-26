import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Send, Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MarkdownEditor } from '@/components/journals/MarkdownEditor';
import { useCreateJournal } from '@/hooks/useJournals';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';

export default function CreateJournal() {
  useSEO({
    title: "Write a Journal",
    description: "Write and share your story, writing journey, or reflections with the WordStack community."
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const createJournal = useCreateJournal();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');

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
      const journal = await createJournal.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || undefined,
        status,
      });
      
      toast({ 
        title: status === 'published' ? 'Journal published!' : 'Draft saved',
      });
      navigate(`/journals/${journal.id}`);
    } catch {
      toast({ title: 'Failed to save journal', variant: 'destructive' });
    }
  };

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

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-3xl font-semibold text-foreground font-poem mb-2">
              Write a Journal
            </h1>
            <p className="text-muted-foreground text-sm">
              Share your story, writing journey, or reflections with the community.
            </p>
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
                disabled={createJournal.isPending}
                className="gap-2"
              >
                {createJournal.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save as Draft
              </Button>
              <Button
                onClick={() => handleSubmit('published')}
                disabled={createJournal.isPending}
                className="gap-2"
              >
                {createJournal.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Publish
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

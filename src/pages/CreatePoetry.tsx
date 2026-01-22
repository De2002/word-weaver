import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Music, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { normalizeTag } from '@/lib/tags';
import { cn } from '@/lib/utils';

const MAX_TITLE_LENGTH = 100;
const MAX_POEM_LENGTH = 5000;
const MAX_TAGS = 10;

export default function CreatePoetry() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const audioInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState('');
  const [poemText, setPoemText] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const normalized = normalizeTag(tagInput);
      if (normalized && !tags.includes(normalized) && tags.length < MAX_TAGS) {
        setTags([...tags, normalized]);
        setTagInput('');
      } else if (tags.length >= MAX_TAGS) {
        toast({
          title: 'Tag limit reached',
          description: `You can add up to ${MAX_TAGS} tags.`,
          variant: 'destructive',
        });
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Audio file must be less than 10MB.',
          variant: 'destructive',
        });
        return;
      }
      if (!file.type.startsWith('audio/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an audio file.',
          variant: 'destructive',
        });
        return;
      }
      setAudioFile(file);
    }
  };

  const handleRemoveAudio = () => {
    setAudioFile(null);
    if (audioInputRef.current) {
      audioInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!poemText.trim()) {
      toast({
        title: 'Poem text required',
        description: 'Please write your poem before publishing.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate submission - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: 'Poem published!',
      description: 'Your poem is now live for everyone to read.',
    });
    
    setIsSubmitting(false);
    navigate('/');
  };

  const canSubmit = poemText.trim().length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-semibold text-foreground">New Poem</h1>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            size="sm"
            className="bg-gradient-to-r from-primary to-warm-gold hover:opacity-90"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Publish'
            )}
          </Button>
        </div>
      </header>

      {/* Form */}
      <main className="p-4 pb-24 max-w-2xl mx-auto">
        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm text-muted-foreground">
              Title <span className="text-xs">(optional)</span>
            </Label>
            <Input
              id="title"
              placeholder="Give your poem a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE_LENGTH))}
              className="bg-secondary/50 border-border focus:border-primary"
            />
            <p className="text-xs text-muted-foreground text-right">
              {title.length}/{MAX_TITLE_LENGTH}
            </p>
          </div>

          {/* Poem Text */}
          <div className="space-y-2">
            <Label htmlFor="poem" className="text-sm text-muted-foreground">
              Your Poem <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="poem"
              placeholder="Write your poem here...

Let your words flow freely,
Each line a new breath,
Each stanza a story untold..."
              value={poemText}
              onChange={(e) => setPoemText(e.target.value.slice(0, MAX_POEM_LENGTH))}
              className="min-h-[300px] bg-secondary/50 border-border focus:border-primary resize-none font-serif text-base leading-relaxed"
            />
            <p className="text-xs text-muted-foreground text-right">
              {poemText.length}/{MAX_POEM_LENGTH}
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-sm text-muted-foreground">
              Tags <span className="text-xs">(press Enter to add)</span>
            </Label>
            <Input
              id="tags"
              placeholder="love, nature, life..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="bg-secondary/50 border-border focus:border-primary"
            />
            <AnimatePresence mode="popLayout">
              {tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap gap-2 pt-2"
                >
                  {tags.map((tag) => (
                    <motion.div
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      layout
                    >
                      <Badge
                        variant="secondary"
                        className="pl-2 pr-1 py-1 gap-1 bg-primary/10 text-primary hover:bg-primary/20"
                      >
                        #{tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            <p className="text-xs text-muted-foreground">
              {tags.length}/{MAX_TAGS} tags
            </p>
          </div>

          {/* Audio Upload */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Audio Reading <span className="text-xs">(optional)</span>
            </Label>
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              onChange={handleAudioUpload}
              className="hidden"
              id="audio-upload"
            />
            
            {audioFile ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg border border-border"
              >
                <div className="p-2 rounded-full bg-primary/10">
                  <Music className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {audioFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={handleRemoveAudio}
                  className="p-1.5 hover:bg-destructive/10 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-destructive" />
                </button>
              </motion.div>
            ) : (
              <label
                htmlFor="audio-upload"
                className={cn(
                  "flex flex-col items-center justify-center gap-2 p-6",
                  "border-2 border-dashed border-border rounded-lg",
                  "cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-colors"
                )}
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    Upload your reading
                  </p>
                  <p className="text-xs text-muted-foreground">
                    MP3, WAV, M4A up to 10MB
                  </p>
                </div>
              </label>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

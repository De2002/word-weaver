import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthProvider';

interface IntroductionFormProps {
  onSubmit: (content: string) => void;
  isSubmitting: boolean;
}

const PROMPTS = [
  "Hi! I'm from... and I write about...",
  "Hello fellow poets! I've been writing for... years and I love...",
  "Greetings! My name is... and poetry means... to me.",
];

export function IntroductionForm({ onSubmit, isSubmitting }: IntroductionFormProps) {
  const { user, profile } = useAuth();
  const [content, setContent] = useState('');
  const [showPrompts, setShowPrompts] = useState(true);

  const displayName = profile?.display_name || profile?.username || 'You';
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content.trim());
      setContent('');
    }
  };

  const usePrompt = (prompt: string) => {
    setContent(prompt);
    setShowPrompts(false);
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border rounded-xl p-4 md:p-5 mb-6"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="font-serif font-semibold text-lg">Introduce Yourself</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <Textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setShowPrompts(false);
              }}
              placeholder="Tell the community about yourself..."
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            
            {/* Prompt suggestions */}
            {showPrompts && !content && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Need a starting point?</p>
                <div className="flex flex-wrap gap-2">
                  {PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => usePrompt(prompt)}
                      className="text-xs bg-muted/50 hover:bg-muted px-3 py-1.5 rounded-full transition-colors text-left"
                    >
                      {prompt.slice(0, 30)}...
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {content.length}/500
              </span>
              <Button 
                type="submit" 
                disabled={!content.trim() || isSubmitting}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                Say Hello
              </Button>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
}

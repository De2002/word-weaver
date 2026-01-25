import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Send } from 'lucide-react';
import { TrailStep, TRAIL_EMOTIONS } from '@/types/trail';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface TrailReviewFormProps {
  steps: TrailStep[];
  onSubmit: (review: {
    comment?: string;
    favoriteStepId?: string;
    emotion?: string;
  }) => void;
  isSubmitting: boolean;
}

export function TrailReviewForm({ steps, onSubmit, isSubmitting }: TrailReviewFormProps) {
  const [comment, setComment] = useState('');
  const [favoriteStepId, setFavoriteStepId] = useState<string | undefined>();
  const [emotion, setEmotion] = useState<string | undefined>();

  const handleSubmit = () => {
    onSubmit({
      comment: comment.trim() || undefined,
      favoriteStepId,
      emotion,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Star className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">
          Journey Complete
        </h2>
        <p className="text-muted-foreground">
          How was your experience walking this trail?
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        {/* Emotion picker */}
        <div>
          <label className="text-sm font-medium text-foreground mb-3 block">
            How did this trail make you feel?
          </label>
          <div className="flex flex-wrap gap-2">
            {TRAIL_EMOTIONS.map((em) => (
              <button
                key={em}
                onClick={() => setEmotion(em === emotion ? undefined : em)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm transition-all",
                  emotion === em
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {em}
              </button>
            ))}
          </div>
        </div>

        {/* Favorite poem picker */}
        <div>
          <label className="text-sm font-medium text-foreground mb-3 block">
            Pick your favorite poem (optional)
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setFavoriteStepId(step.id === favoriteStepId ? undefined : step.id)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-all",
                  favoriteStepId === step.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                )}
              >
                <span className="text-sm font-medium text-foreground line-clamp-1">
                  {step.poem?.title || 'Untitled'}
                </span>
                <span className="text-xs text-muted-foreground">
                  by {step.poem?.poet?.display_name || step.poem?.poet?.username || 'Anonymous'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Short comment */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Leave a short note (max 120 chars)
          </label>
          <div className="relative">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 120))}
              placeholder="A beautiful journey through..."
              className="resize-none"
              rows={3}
            />
            <span className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              {comment.length}/120
            </span>
          </div>
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full"
          size="lg"
        >
          <Send className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </div>
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TrailStep, TRAIL_REACTION_EMOJIS, TRAIL_REACTION_LABELS } from '@/types/trail';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthProvider';

interface TrailStepViewProps {
  step: TrailStep;
  stepNumber: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onReaction: (emoji: string) => void;
  isFirst: boolean;
  isLast: boolean;
}

export function TrailStepView({
  step,
  stepNumber,
  totalSteps,
  onPrevious,
  onNext,
  onReaction,
  isFirst,
  isLast,
}: TrailStepViewProps) {
  const { user } = useAuth();

  const getReactionCount = (emoji: string) => {
    return step.reactions?.find((r) => r.emoji === emoji)?.count || 0;
  };

  const hasReacted = (emoji: string) => {
    return step.user_reactions?.includes(emoji) || false;
  };

  return (
    <motion.div
      key={step.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto"
    >
      {/* Step indicator */}
      <div className="text-center mb-6">
        <span className="text-sm text-muted-foreground">
          Step {stepNumber} of {totalSteps}
        </span>
      </div>

      {/* Poem content */}
      <article className="bg-card border border-border rounded-xl p-6 md:p-8 mb-6">
        {/* Poet info */}
        {step.poem?.poet && (
          <Link
            to={`/poet/${step.poem.poet.username}`}
            className="flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={step.poem.poet.avatar_url || undefined} />
              <AvatarFallback>
                {(step.poem.poet.display_name || step.poem.poet.username || 'P').charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="font-medium text-foreground">
                {step.poem.poet.display_name || step.poem.poet.username}
              </span>
              {step.poem.poet.username && (
                <span className="text-muted-foreground text-sm block">
                  @{step.poem.poet.username}
                </span>
              )}
            </div>
          </Link>
        )}

        {/* Title */}
        {step.poem?.title && (
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-6">
            {step.poem.title}
          </h2>
        )}

        {/* Poem text */}
        <div className="font-serif text-lg md:text-xl leading-relaxed text-foreground whitespace-pre-line mb-8">
          {step.poem?.content}
        </div>

        {/* Reactions */}
        <div className="border-t border-border pt-4">
          <p className="text-sm text-muted-foreground mb-3">How did this make you feel?</p>
          <div className="flex flex-wrap gap-2">
            {TRAIL_REACTION_EMOJIS.map((emoji) => {
              const count = getReactionCount(emoji);
              const reacted = hasReacted(emoji);
              
              return (
                <motion.button
                  key={emoji}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => user && onReaction(emoji)}
                  disabled={!user}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all",
                    reacted
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                    !user && "opacity-50 cursor-not-allowed"
                  )}
                  title={TRAIL_REACTION_LABELS[emoji]}
                >
                  <span className="text-base">{emoji}</span>
                  {count > 0 && <span className="font-medium">{count}</span>}
                </motion.button>
              );
            })}
          </div>
        </div>
      </article>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isFirst}
          className="flex-1 max-w-[140px]"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <div className="flex-1 flex justify-center">
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-2 w-2 rounded-full transition-colors",
                  i + 1 === stepNumber
                    ? "bg-primary"
                    : i + 1 < stepNumber
                    ? "bg-primary/40"
                    : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>

        <Button
          onClick={onNext}
          className="flex-1 max-w-[140px]"
        >
          {isLast ? 'Finish' : 'Next Stop'}
          {!isLast && <ChevronRight className="h-4 w-4 ml-1" />}
        </Button>
      </div>
    </motion.div>
  );
}

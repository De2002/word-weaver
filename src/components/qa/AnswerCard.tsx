import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { QAAnswer } from '@/types/qa';
import { cn } from '@/lib/utils';
import { sanitizeRichTextHtml } from '@/lib/qaRichText';

interface AnswerCardProps {
  answer: QAAnswer;
  isQuestionOwner: boolean;
  onVote: (answerId: string, hasVoted: boolean) => Promise<void>;
  onAccept: (answerId: string) => Promise<void>;
  currentUserId?: string;
}

export function AnswerCard({ answer, isQuestionOwner, onVote, onAccept, currentUserId }: AnswerCardProps) {
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async () => {
    if (!currentUserId) return;
    setIsVoting(true);
    try {
      await onVote(answer.id, answer.has_voted);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className={cn(
      "px-4 py-4 border-b border-border",
      answer.is_accepted && "bg-primary/5 border-l-2 border-l-primary"
    )}>
      {answer.is_accepted && (
        <div className="flex items-center gap-1.5 mb-3">
          <CheckCircle className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-primary">Accepted Answer</span>
        </div>
      )}

      {/* Poet info */}
      <div className="flex items-center justify-between mb-3">
        <Link to={`/poet/${answer.poet.username}`} className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={answer.poet.avatar_url || undefined} />
            <AvatarFallback className="text-[10px]">
              {(answer.poet.display_name || answer.poet.username || 'A')[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium leading-none">
                {answer.poet.display_name || `@${answer.poet.username}`}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              {formatDistanceToNow(new Date(answer.created_at), { addSuffix: true })}
            </span>
          </div>
        </Link>

        {/* Accept button — shown only to question owner */}
        {isQuestionOwner && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAccept(answer.id)}
            className={cn(
              "h-7 px-2 text-xs gap-1",
              answer.is_accepted ? "text-primary" : "text-muted-foreground hover:text-primary"
            )}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            {answer.is_accepted ? 'Accepted' : 'Accept'}
          </Button>
        )}
      </div>

      {/* Answer content */}
      <div
        className="text-sm leading-relaxed text-foreground mb-3 space-y-2 [&_a]:text-primary [&_a]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-muted [&_pre]:p-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
        dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(answer.content) }}
      />

      {/* Vote */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={isVoting || !currentUserId}
          onClick={handleVote}
          className={cn(
            "h-7 px-2 gap-1.5 text-xs",
            answer.has_voted ? "text-primary" : "text-muted-foreground"
          )}
        >
          <ThumbsUp className={cn("h-3.5 w-3.5", answer.has_voted && "fill-primary")} />
          <span>{answer.vote_count}</span>
        </Button>
        <span className="text-xs text-muted-foreground">
          {answer.vote_count === 1 ? 'helpful' : 'found this helpful'}
        </span>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, CheckCircle, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { QAQuestion, QA_CATEGORIES } from '@/types/qa';
import { toUrlSlug } from '@/lib/slug';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: QAQuestion;
}

export function QuestionCard({ question }: QuestionCardProps) {
  const categoryLabel = QA_CATEGORIES.find(c => c.value === question.category)?.label || 'General';
  const hasAccepted = !!question.accepted_answer_id;

  return (
    <Link
      to={`/qa/${question.id}/${toUrlSlug(question.title)}`}
      className="block px-4 py-4 border-b border-border hover:bg-secondary/20 transition-colors"
    >
      <div className="flex gap-3">
        {/* Stats column */}
        <div className="flex flex-col items-center gap-2 min-w-[48px] pt-0.5">
          <div className={cn(
            "flex flex-col items-center text-center",
            hasAccepted ? "text-primary" : "text-muted-foreground"
          )}>
            <span className="text-base font-bold leading-none">{question.answer_count}</span>
            <span className="text-[10px] mt-0.5 leading-none">
              {hasAccepted ? 'solved' : 'ans'}
            </span>
          </div>
          {hasAccepted && (
            <CheckCircle className="h-4 w-4 text-primary" />
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-serif text-base font-medium leading-snug line-clamp-2 text-foreground">
              {question.title}
            </h3>
            {question.is_featured && (
              <Star className="h-4 w-4 text-amber-500 shrink-0 fill-amber-500 mt-0.5" />
            )}
          </div>

          {question.details && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {question.details}
            </p>
          )}

          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-normal">
                {categoryLabel}
              </Badge>
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <MessageCircle className="h-3 w-3" />
                {question.answer_count}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Avatar className="h-5 w-5">
                <AvatarImage src={question.poet.avatar_url || undefined} />
                <AvatarFallback className="text-[8px]">
                  {(question.poet.display_name || question.poet.username || 'A')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-[11px] text-muted-foreground">
                {question.poet.display_name || `@${question.poet.username}`}
              </span>
              <span className="text-[11px] text-muted-foreground">·</span>
              <span className="text-[11px] text-muted-foreground">
                {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

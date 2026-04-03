import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Eye, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AnswerCard } from '@/components/qa/AnswerCard';
import { RichTextEditor } from '@/components/qa/RichTextEditor';
import { useQAQuestion } from '@/hooks/useQAQuestion';
import { useAuth } from '@/context/AuthProvider';
import { QA_CATEGORIES } from '@/types/qa';
import { useToast } from '@/hooks/use-toast';
import { richTextToPlainText, sanitizeRichTextHtml } from '@/lib/qaRichText';

export default function QADetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [answerText, setAnswerText] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const { question, answers, isLoading, postAnswer, toggleVote, acceptAnswer } = useQAQuestion(slug!);

  const isOwner = user?.id === question?.user_id;
  const categoryLabel = QA_CATEGORIES.find(c => c.value === question?.category)?.label || 'General';

  const handlePostAnswer = async () => {
    const cleanAnswer = sanitizeRichTextHtml(answerText);
    if (!richTextToPlainText(cleanAnswer)) return;
    setIsPosting(true);
    try {
      await postAnswer(cleanAnswer);
      setAnswerText('');
      toast({ title: 'Answer posted!' });
    } catch (err: any) {
      toast({ title: 'Could not post answer', description: err.message, variant: 'destructive' });
    } finally {
      setIsPosting(false);
    }
  };

  const handleVote = async (answerId: string, hasVoted: boolean) => {
    if (!user) {
      toast({ title: 'Sign in to vote' });
      return;
    }
    try {
      await toggleVote(answerId, hasVoted);
    } catch (err: any) {
      toast({ title: 'Could not vote', description: err.message, variant: 'destructive' });
    }
  };

  const handleAccept = async (answerId: string) => {
    try {
      await acceptAnswer(answerId);
    } catch (err: any) {
      toast({ title: 'Could not update', description: err.message, variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-4">
        <Skeleton className="h-5 w-32 mb-4" />
        <Skeleton className="h-8 w-full mb-3" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Question not found.</p>
        <Button variant="link" onClick={() => navigate('/qa')}>Back to Q&A</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/qa')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="font-serif text-base font-medium truncate">Question</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Question */}
        <div className="px-4 py-5 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="text-[10px] font-normal">
              {categoryLabel}
            </Badge>
            {question.accepted_answer_id && (
              <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">
                Solved
              </Badge>
            )}
          </div>

          <h1 className="font-serif text-2xl font-semibold mb-3 leading-snug">
            {question.title}
          </h1>

          {question.details && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 whitespace-pre-wrap">
              {question.details}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <Link to={`/poet/${question.poet.username}`} className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={question.poet.avatar_url || undefined} />
                <AvatarFallback className="text-[9px]">
                  {(question.poet.display_name || question.poet.username || 'A')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{question.poet.display_name || `@${question.poet.username}`}</span>
            </Link>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {question.views}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" />
                {answers.length}
              </span>
              <span>{formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}</span>
            </div>
          </div>
        </div>

        {/* Answers */}
        {answers.length > 0 && (
          <div>
            <div className="px-4 py-3 border-b border-border">
              <h2 className="font-serif text-base font-medium">
                {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
              </h2>
            </div>
            {answers.map(answer => (
              <AnswerCard
                key={answer.id}
                answer={answer}
                isQuestionOwner={isOwner}
                onVote={handleVote}
                onAccept={handleAccept}
                currentUserId={user?.id}
              />
            ))}
          </div>
        )}

        {answers.length === 0 && (
          <div className="text-center py-10 px-4">
            <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No answers yet. Be the first to share your wisdom!</p>
          </div>
        )}

        {/* Answer input */}
        <div className="px-4 py-5 border-t border-border mt-2">
          {!user ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-3">Sign in to participate</p>
              <Button size="sm" asChild><a href="/login">Sign in</a></Button>
            </div>
          ) : (

            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium">Post an answer</span>
              </div>
              <RichTextEditor
                value={answerText}
                onChange={setAnswerText}
                placeholder="Share your expertise…"
                className="mb-3"
              />
              <p className="text-xs text-muted-foreground mb-3">Supports rich formatting and markdown (paste markdown to auto-convert).</p>
              <Button
                onClick={handlePostAnswer}
                disabled={isPosting || !richTextToPlainText(answerText)}
                className="gap-2"
              >
                <Send className="h-3.5 w-3.5" />
                {isPosting ? 'Posting…' : 'Post Answer'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

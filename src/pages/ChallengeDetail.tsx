import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Trophy, Calendar, Crown, Loader2, Send,
  CheckCircle, Clock, Users, Feather, Lock, X
} from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useChallenge, useChallengeSubmissions, useMySubmission, useWithdrawSubmission } from '@/hooks/useChallenges';
import { SubmitToChallengeForm } from '@/components/challenges/SubmitToChallengeForm';
import { useAuth } from '@/context/AuthProvider';
import { useSEO } from '@/hooks/useSEO';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  active: { label: 'Open for submissions', className: 'bg-green-500/15 text-green-600 border-green-500/25' },
  judging: { label: 'Under review', className: 'bg-amber-500/15 text-amber-600 border-amber-500/25' },
  closed: { label: 'Closed', className: 'bg-muted text-muted-foreground border-border' },
  draft: { label: 'Draft', className: 'bg-secondary text-muted-foreground border-border' },
};

export default function ChallengeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, roles } = useAuth();
  const { toast } = useToast();
  const [submitOpen, setSubmitOpen] = useState(false);

  const { data: challenge, isLoading } = useChallenge(id!);
  const { data: submissions } = useChallengeSubmissions(id!);
  const { data: mySubmission } = useMySubmission(id!);
  const withdraw = useWithdrawSubmission();

  useSEO({
    title: challenge ? `${challenge.title} – Challenge` : 'Challenge',
    description: challenge?.description || '',
  });

  const isPro = roles.includes('pro') || roles.includes('admin');
  const isActive = challenge?.status === 'active';
  const deadline = challenge ? new Date(challenge.end_date) : null;
  const statusStyle = challenge ? (STATUS_STYLES[challenge.status] || STATUS_STYLES.closed) : STATUS_STYLES.closed;

  const handleWithdraw = async () => {
    if (!mySubmission) return;
    try {
      await withdraw.mutateAsync({ submissionId: mySubmission.id, challengeId: id! });
      toast({ title: 'Submission withdrawn' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <Trophy className="h-10 w-10 opacity-30" />
        <p>Challenge not found.</p>
        <Button variant="ghost" onClick={() => navigate('/challenges')}>Back to Challenges</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => navigate('/challenges')}
            className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Challenge</p>
            <p className="font-semibold text-sm truncate">{challenge.title}</p>
          </div>
          <Badge className={cn('text-[10px] border shrink-0', statusStyle.className)}>
            {statusStyle.label}
          </Badge>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Cover */}
        {challenge.cover_url && (
          <div
            className="w-full h-44 rounded-2xl overflow-hidden"
            style={{ background: `url(${challenge.cover_url}) center/cover no-repeat` }}
          />
        )}

        {/* Title block */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {challenge.month} Challenge
          </p>
          <h1 className="text-2xl font-bold">{challenge.title}</h1>
          {challenge.theme && (
            <p className="text-sm text-muted-foreground">
              Theme: <span className="text-foreground font-medium">{challenge.theme}</span>
            </p>
          )}

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(challenge.start_date), 'MMM d')} – {format(new Date(challenge.end_date), 'MMM d, yyyy')}
            </span>
            {isActive && deadline && !isPast(deadline) && (
              <span className="flex items-center gap-1 text-primary font-semibold">
                <Clock className="h-3.5 w-3.5" />
                Closes {formatDistanceToNow(deadline, { addSuffix: true })}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {submissions?.length || 0} submission{(submissions?.length || 0) !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <Separator />

        {/* Description */}
        <div className="space-y-1">
          <h2 className="text-sm font-semibold">About this challenge</h2>
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
            {challenge.description}
          </p>
        </div>

        {/* Prompt */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary">The Prompt</h2>
          <p className="text-sm leading-relaxed font-medium text-foreground whitespace-pre-wrap">
            {challenge.prompt}
          </p>
        </div>

        {/* Prize */}
        {challenge.prize_description && (
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 flex items-start gap-3">
            <Trophy className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">Prize</h2>
              <p className="text-sm text-foreground/80">{challenge.prize_description}</p>
            </div>
          </div>
        )}

        {/* CTA */}
        {isActive && (
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            {!user ? (
              <div className="text-center space-y-3">
                <Crown className="h-7 w-7 text-primary mx-auto" />
                <p className="text-sm font-medium">Sign in to participate</p>
                <Button asChild size="sm">
                  <Link to="/login">Sign in</Link>
                </Button>
              </div>
            ) : !isPro ? (
              <div className="text-center space-y-3">
                <Lock className="h-7 w-7 text-muted-foreground mx-auto" />
                <div>
                  <p className="text-sm font-semibold">Pro Poets only</p>
                  <p className="text-xs text-muted-foreground mt-1">Upgrade to Pro to submit to challenges.</p>
                </div>
                <Button asChild size="sm" className="gap-1.5">
                  <Link to="/upgrade">
                    <Crown className="h-3.5 w-3.5" />
                    Go Pro
                  </Link>
                </Button>
              </div>
            ) : mySubmission ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <p className="text-sm font-medium">Submitted</p>
                  <Badge className="text-[10px] ml-auto">
                    {mySubmission.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  "{mySubmission.poem?.title || 'Untitled'}" · Submitted {formatDistanceToNow(new Date(mySubmission.submitted_at), { addSuffix: true })}
                </p>
                {mySubmission.status === 'pending' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-destructive hover:text-destructive w-full"
                    onClick={handleWithdraw}
                    disabled={withdraw.isPending}
                  >
                    {withdraw.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                    Withdraw submission
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Feather className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold">Ready to compete?</p>
                </div>
                <p className="text-xs text-muted-foreground">Submit one of your published poems to this challenge.</p>
                <Button onClick={() => setSubmitOpen(true)} className="w-full gap-2" size="sm">
                  <Send className="h-3.5 w-3.5" />
                  Submit a poem
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Submissions */}
        {(submissions || []).length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Submissions ({submissions!.length})
            </h2>
            {submissions!.map((sub, i) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={cn(
                  "rounded-xl border border-border p-4 space-y-2",
                  sub.is_winner && "border-amber-500/40 bg-amber-500/5"
                )}
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={sub.profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {(sub.profile?.display_name || sub.profile?.username || '?')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/poet/${sub.profile?.username}`}
                      className="text-xs font-medium hover:underline"
                    >
                      {sub.profile?.display_name || `@${sub.profile?.username}`}
                    </Link>
                  </div>
                  {sub.is_winner && (
                    <Badge className="text-[10px] bg-amber-500/15 text-amber-600 border-amber-500/25 gap-1">
                      <Trophy className="h-2.5 w-2.5" />
                      Winner
                    </Badge>
                  )}
                </div>
                <Link
                  to={`/poem/${sub.poem?.slug}`}
                  className="block text-sm font-semibold hover:text-primary transition-colors line-clamp-1"
                >
                  {sub.poem?.title || 'Untitled'}
                </Link>
                <p className="text-xs text-foreground/60 line-clamp-2 font-serif">
                  {sub.poem?.content.slice(0, 120)}…
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Submit dialog */}
      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Submit to "{challenge.title}"
            </DialogTitle>
            <DialogDescription>
              Choose a published poem from your portfolio. One submission per challenge.
            </DialogDescription>
          </DialogHeader>
          <SubmitToChallengeForm
            challengeId={id!}
            onSuccess={() => setSubmitOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

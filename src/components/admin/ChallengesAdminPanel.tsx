import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import {
  Trophy, Plus, ChevronDown, ChevronUp, Loader2, Check,
  X, Crown, Trash2, Edit2, Eye, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import {
  useAdminChallenges, useAdminChallengeSubmissions,
  useCreateChallenge, useUpdateChallenge, useUpdateSubmissionStatus,
  Challenge, ChallengeSubmission
} from '@/hooks/useChallenges';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  active: 'bg-green-500/15 text-green-600',
  judging: 'bg-amber-500/15 text-amber-600',
  closed: 'bg-secondary text-muted-foreground',
};

const SUB_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-600',
  approved: 'bg-green-500/15 text-green-600',
  rejected: 'bg-red-500/15 text-red-600',
  winner: 'bg-amber-500/15 text-amber-700',
};

// ── Create/Edit form ──────────────────────────────────────────────────────────

const schema = z.object({
  title: z.string().min(3, 'Min 3 characters'),
  description: z.string().min(20, 'Min 20 characters'),
  prompt: z.string().min(10, 'Min 10 characters'),
  theme: z.string().optional(),
  prize_description: z.string().optional(),
  month: z.string().min(1, 'Required'),
  start_date: z.string().min(1, 'Required'),
  end_date: z.string().min(1, 'Required'),
  status: z.enum(['draft', 'active', 'judging', 'closed']),
});
type FormData = z.infer<typeof schema>;

function ChallengeForm({
  defaultValues,
  onSubmit,
  isPending,
  onCancel,
}: {
  defaultValues?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  isPending: boolean;
  onCancel: () => void;
}) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      prompt: '',
      theme: '',
      prize_description: '',
      month: '',
      start_date: '',
      end_date: '',
      status: 'draft',
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>Title</FormLabel>
              <FormControl><Input placeholder="e.g. March Metamorphosis" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="month" render={({ field }) => (
            <FormItem>
              <FormLabel>Month label</FormLabel>
              <FormControl><Input placeholder="e.g. March 2026" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {['draft', 'active', 'judging', 'closed'].map(s => (
                    <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="start_date" render={({ field }) => (
            <FormItem>
              <FormLabel>Start date</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="end_date" render={({ field }) => (
            <FormItem>
              <FormLabel>End date</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="theme" render={({ field }) => (
          <FormItem>
            <FormLabel>Theme <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
            <FormControl><Input placeholder="e.g. Transformation, Loss, Wonder" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="prompt" render={({ field }) => (
          <FormItem>
            <FormLabel>Prompt</FormLabel>
            <FormControl>
              <Textarea placeholder="The creative brief participants will respond to…" rows={3} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Full description</FormLabel>
            <FormControl>
              <Textarea placeholder="Context, rules, judging criteria…" rows={4} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="prize_description" render={({ field }) => (
          <FormItem>
            <FormLabel>Prize <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
            <FormControl><Input placeholder="e.g. Featured on homepage + $50 gift card" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={isPending} className="flex-1 gap-2">
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save challenge
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </Form>
  );
}

// ── Submissions panel ─────────────────────────────────────────────────────────

function SubmissionsPanel({ challenge }: { challenge: Challenge }) {
  const { data: subs, isLoading } = useAdminChallengeSubmissions(challenge.id);
  const updateStatus = useUpdateSubmissionStatus();
  const { toast } = useToast();

  const handleStatus = async (sub: ChallengeSubmission, status: ChallengeSubmission['status'], isWinner = false) => {
    try {
      await updateStatus.mutateAsync({ submissionId: sub.id, challengeId: challenge.id, status, isWinner });
      toast({ title: isWinner ? '🏆 Winner declared!' : 'Status updated' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  if (isLoading) return <div className="py-4"><Skeleton className="h-12 w-full rounded-xl" /></div>;
  if (!subs || subs.length === 0) return (
    <p className="text-xs text-muted-foreground text-center py-6">No submissions yet.</p>
  );

  return (
    <div className="space-y-2 mt-3">
      {subs.map(sub => (
        <div key={sub.id} className={cn(
          "rounded-xl border border-border p-3 space-y-2",
          sub.is_winner && "border-amber-500/40 bg-amber-500/5"
        )}>
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarImage src={sub.profile?.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {(sub.profile?.display_name || sub.profile?.username || '?')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <Link to={`/poet/${sub.profile?.username}`} className="text-xs font-medium hover:underline">
                {sub.profile?.display_name || `@${sub.profile?.username}`}
              </Link>
              <p className="text-[10px] text-muted-foreground">{format(new Date(sub.submitted_at), 'MMM d, yyyy')}</p>
            </div>
            <Badge className={cn('text-[10px]', SUB_STATUS_COLORS[sub.status])}>
              {sub.is_winner ? '🏆 Winner' : sub.status}
            </Badge>
          </div>

          <Link to={`/poem/${sub.poem?.slug}`} className="block text-sm font-semibold hover:text-primary transition-colors">
            {sub.poem?.title || 'Untitled'}
          </Link>

          {sub.note && (
            <p className="text-xs text-muted-foreground italic bg-secondary rounded-lg p-2">"{sub.note}"</p>
          )}

          <div className="flex gap-1.5 flex-wrap">
            {sub.status === 'pending' && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs border-green-500/50 text-green-600 hover:bg-green-500/10 h-7 px-2"
                onClick={() => handleStatus(sub, 'approved')}
                disabled={updateStatus.isPending}
              >
                <Check className="h-3 w-3 mr-1" /> Approve
              </Button>
            )}
            {sub.status === 'pending' && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs border-red-500/50 text-red-600 hover:bg-red-500/10 h-7 px-2"
                onClick={() => handleStatus(sub, 'rejected')}
                disabled={updateStatus.isPending}
              >
                <X className="h-3 w-3 mr-1" /> Reject
              </Button>
            )}
            {sub.status === 'approved' && !sub.is_winner && challenge.status !== 'closed' && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs border-amber-500/50 text-amber-600 hover:bg-amber-500/10 h-7 px-2"
                onClick={() => handleStatus(sub, 'winner', true)}
                disabled={updateStatus.isPending}
              >
                <Trophy className="h-3 w-3 mr-1" /> Declare winner
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Challenge row ─────────────────────────────────────────────────────────────

function ChallengeRow({ challenge }: { challenge: Challenge }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showSubs, setShowSubs] = useState(false);
  const update = useUpdateChallenge();
  const { toast } = useToast();

  const handleEdit = async (data: FormData) => {
    try {
      await update.mutateAsync({ id: challenge.id, ...data });
      toast({ title: 'Challenge updated' });
      setEditing(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Trophy className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm truncate">{challenge.title}</p>
            <Badge className={cn('text-[10px] shrink-0', STATUS_COLORS[challenge.status])}>
              {challenge.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {challenge.month} · {format(new Date(challenge.start_date), 'MMM d')} – {format(new Date(challenge.end_date), 'MMM d, yyyy')}
          </p>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
      </div>

      {expanded && (
        <div className="border-t border-border p-4 space-y-4 bg-secondary/10">
          {editing ? (
            <ChallengeForm
              defaultValues={{
                title: challenge.title,
                description: challenge.description,
                prompt: challenge.prompt,
                theme: challenge.theme || '',
                prize_description: challenge.prize_description || '',
                month: challenge.month,
                start_date: challenge.start_date,
                end_date: challenge.end_date,
                status: challenge.status as any,
              }}
              onSubmit={handleEdit}
              isPending={update.isPending}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">Prompt</p>
                <p className="text-sm text-foreground/80">{challenge.prompt}</p>
              </div>
              {challenge.prize_description && (
                <p className="text-xs text-amber-600"><Trophy className="inline h-3 w-3 mr-1" />{challenge.prize_description}</p>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs gap-1.5"
                  onClick={() => setEditing(true)}
                >
                  <Edit2 className="h-3 w-3" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs gap-1.5"
                  onClick={() => setShowSubs(s => !s)}
                >
                  <Users className="h-3 w-3" />
                  {showSubs ? 'Hide' : 'View'} submissions
                </Button>
                <Button size="sm" variant="ghost" className="text-xs gap-1.5" asChild>
                  <Link to={`/challenges/${challenge.id}`}>
                    <Eye className="h-3 w-3" /> Preview
                  </Link>
                </Button>
              </div>
              {showSubs && <SubmissionsPanel challenge={challenge} />}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function ChallengesAdminPanel() {
  const [showCreate, setShowCreate] = useState(false);
  const { data: challenges, isLoading } = useAdminChallenges();
  const create = useCreateChallenge();
  const { toast } = useToast();

  const handleCreate = async (data: FormData) => {
    try {
      await create.mutateAsync(data as any);
      toast({ title: 'Challenge created!' });
      setShowCreate(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">Poetry Challenges</h2>
            <p className="text-sm text-muted-foreground">
              {challenges?.length || 0} challenge{(challenges?.length || 0) !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => setShowCreate(s => !s)}
        >
          <Plus className="h-4 w-4" />
          New challenge
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary" />
              Create monthly challenge
            </CardTitle>
            <CardDescription>Only Pro Poets will be able to submit.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChallengeForm
              onSubmit={handleCreate}
              isPending={create.isPending}
              onCancel={() => setShowCreate(false)}
            />
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))
      ) : !challenges || challenges.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center text-muted-foreground">
            <Trophy className="h-10 w-10 mb-3 opacity-30" />
            <p className="font-medium">No challenges yet</p>
            <p className="text-sm mt-1">Create your first monthly challenge above.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {challenges.map(c => <ChallengeRow key={c.id} challenge={c} />)}
        </div>
      )}
    </div>
  );
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';

export interface Challenge {
  id: string;
  created_by: string;
  title: string;
  description: string;
  prompt: string;
  theme: string | null;
  prize_description: string | null;
  cover_url: string | null;
  status: 'draft' | 'active' | 'judging' | 'closed';
  month: string;
  start_date: string;
  end_date: string;
  winner_submission_id: string | null;
  created_at: string;
  updated_at: string;
  submission_count?: number;
}

export interface ChallengeSubmission {
  id: string;
  challenge_id: string;
  user_id: string;
  poem_id: string;
  note: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'winner';
  is_winner: boolean;
  submitted_at: string;
  poem?: {
    id: string;
    title: string | null;
    content: string;
    slug: string;
  };
  profile?: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
}

const db = supabase as any;

// ── Public hooks ────────────────────────────────────────────────────────────

export function useChallenges() {
  return useQuery({
    queryKey: ['challenges'],
    queryFn: async (): Promise<Challenge[]> => {
      const { data, error } = await db
        .from('challenges')
        .select('*')
        .in('status', ['active', 'judging', 'closed'])
        .order('start_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useChallenge(id: string) {
  return useQuery({
    queryKey: ['challenge', id],
    queryFn: async (): Promise<Challenge | null> => {
      const { data, error } = await db
        .from('challenges')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useChallengeSubmissions(challengeId: string) {
  return useQuery({
    queryKey: ['challenge-submissions', challengeId],
    queryFn: async (): Promise<ChallengeSubmission[]> => {
      const { data, error } = await db
        .from('challenge_submissions')
        .select(`
          *,
          poem:poems(id, title, content, slug),
          profile:profiles!challenge_submissions_user_id_fkey(username, display_name, avatar_url)
        `)
        .eq('challenge_id', challengeId)
        .eq('status', 'approved')
        .order('submitted_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!challengeId,
  });
}

export function useMySubmission(challengeId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-challenge-submission', challengeId, user?.id],
    queryFn: async (): Promise<ChallengeSubmission | null> => {
      if (!user) return null;
      const { data, error } = await db
        .from('challenge_submissions')
        .select('*, poem:poems(id, title, content, slug)')
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!challengeId && !!user,
  });
}

export function useSubmitToChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      challengeId,
      poemId,
      note,
    }: {
      challengeId: string;
      poemId: string;
      note?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await db
        .from('challenge_submissions')
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          poem_id: poemId,
          note: note || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['challenge-submissions', vars.challengeId] });
      qc.invalidateQueries({ queryKey: ['my-challenge-submission', vars.challengeId] });
    },
  });
}

export function useWithdrawSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      submissionId,
      challengeId,
    }: {
      submissionId: string;
      challengeId: string;
    }) => {
      const { error } = await db
        .from('challenge_submissions')
        .delete()
        .eq('id', submissionId);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['challenge-submissions', vars.challengeId] });
      qc.invalidateQueries({ queryKey: ['my-challenge-submission', vars.challengeId] });
    },
  });
}

// ── Admin hooks ──────────────────────────────────────────────────────────────

export function useAdminChallenges() {
  return useQuery({
    queryKey: ['admin-challenges'],
    queryFn: async (): Promise<Challenge[]> => {
      const { data, error } = await db
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useAdminChallengeSubmissions(challengeId: string) {
  return useQuery({
    queryKey: ['admin-challenge-submissions', challengeId],
    queryFn: async (): Promise<ChallengeSubmission[]> => {
      const { data, error } = await db
        .from('challenge_submissions')
        .select(`
          *,
          poem:poems(id, title, content, slug),
          profile:profiles(username, display_name, avatar_url)
        `)
        .eq('challenge_id', challengeId)
        .order('submitted_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!challengeId,
  });
}

export function useCreateChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Challenge, 'id' | 'created_at' | 'updated_at' | 'winner_submission_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await db
        .from('challenges')
        .insert({ ...payload, created_by: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-challenges'] });
      qc.invalidateQueries({ queryKey: ['challenges'] });
    },
  });
}

export function useUpdateChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Challenge> & { id: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch old status before update to detect transition → active
      const { data: old } = await db.from('challenges').select('status').eq('id', id).single() as any;
      const wasActive = old?.status === 'active';
      const willBeActive = (payload as any).status === 'active';

      const { data, error } = await db
        .from('challenges')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;

      // Notify all Pro Poets when challenge transitions to active
      if (!wasActive && willBeActive) {
        const { data: proUsers } = await db
          .from('user_roles')
          .select('user_id')
          .eq('role', 'pro') as any;

        if (proUsers && proUsers.length > 0) {
          const notifications = proUsers.map((u: { user_id: string }) => ({
            user_id: u.user_id,
            actor_id: user.id,
            type: 'challenge_open',
            challenge_id: id,
          }));
          // Insert in batches of 100
          for (let i = 0; i < notifications.length; i += 100) {
            await db.from('notifications').insert(notifications.slice(i, i + 100)) as any;
          }
        }
      }

      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['admin-challenges'] });
      qc.invalidateQueries({ queryKey: ['challenges'] });
      qc.invalidateQueries({ queryKey: ['challenge', data.id] });
    },
  });
}

export function useUpdateSubmissionStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      submissionId,
      challengeId,
      status,
      isWinner,
    }: {
      submissionId: string;
      challengeId: string;
      status: ChallengeSubmission['status'];
      isWinner?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await db
        .from('challenge_submissions')
        .update({ status, is_winner: isWinner ?? false })
        .eq('id', submissionId)
        .select()
        .single();
      if (error) throw error;

      // If declaring winner, update challenge and notify the winner
      if (isWinner) {
        await db
          .from('challenges')
          .update({ winner_submission_id: submissionId, status: 'closed' })
          .eq('id', challengeId);

        // Insert winner notification for the submission owner
        await db.from('notifications').insert({
          user_id: (data as any).user_id,
          actor_id: user.id,
          type: 'challenge_winner',
          challenge_id: challengeId,
        }) as any;
      }

      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admin-challenge-submissions', vars.challengeId] });
      qc.invalidateQueries({ queryKey: ['challenge-submissions', vars.challengeId] });
      qc.invalidateQueries({ queryKey: ['admin-challenges'] });
      qc.invalidateQueries({ queryKey: ['challenges'] });
    },
  });
}

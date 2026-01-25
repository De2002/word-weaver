import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';
import { Journal, JournalComment } from '@/types/journal';

export function useJournals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['journals'],
    queryFn: async () => {
      // Fetch published journals with profile info
      const { data: journals, error } = await supabase
        .from('journals')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles for all journals
      const userIds = [...new Set(journals.map(j => j.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, username, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Fetch likes counts
      const journalIds = journals.map(j => j.id);
      const { data: likeCounts } = await supabase
        .from('journal_likes')
        .select('journal_id')
        .in('journal_id', journalIds);

      const likeCountMap = new Map<string, number>();
      likeCounts?.forEach(l => {
        likeCountMap.set(l.journal_id, (likeCountMap.get(l.journal_id) || 0) + 1);
      });

      // Fetch comment counts
      const { data: commentCounts } = await supabase
        .from('journal_comments')
        .select('journal_id')
        .in('journal_id', journalIds);

      const commentCountMap = new Map<string, number>();
      commentCounts?.forEach(c => {
        commentCountMap.set(c.journal_id, (commentCountMap.get(c.journal_id) || 0) + 1);
      });

      // Check if current user has liked each journal
      let userLikes: string[] = [];
      if (user) {
        const { data: likes } = await supabase
          .from('journal_likes')
          .select('journal_id')
          .eq('user_id', user.id)
          .in('journal_id', journalIds);
        userLikes = likes?.map(l => l.journal_id) || [];
      }

      return journals.map(journal => ({
        ...journal,
        status: journal.status as 'draft' | 'published',
        profile: profileMap.get(journal.user_id) || null,
        likes_count: likeCountMap.get(journal.id) || 0,
        comments_count: commentCountMap.get(journal.id) || 0,
        is_liked: userLikes.includes(journal.id),
      })) as Journal[];
    },
  });
}

export function useJournal(id: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['journal', id],
    queryFn: async () => {
      const { data: journal, error } = await supabase
        .from('journals')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!journal) return null;

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, username, avatar_url')
        .eq('user_id', journal.user_id)
        .maybeSingle();

      // Fetch likes count
      const { count: likesCount } = await supabase
        .from('journal_likes')
        .select('*', { count: 'exact', head: true })
        .eq('journal_id', id);

      // Fetch comments count
      const { count: commentsCount } = await supabase
        .from('journal_comments')
        .select('*', { count: 'exact', head: true })
        .eq('journal_id', id);

      // Check if user liked
      let isLiked = false;
      if (user) {
        const { data: like } = await supabase
          .from('journal_likes')
          .select('id')
          .eq('journal_id', id)
          .eq('user_id', user.id)
          .maybeSingle();
        isLiked = !!like;
      }

      return {
        ...journal,
        status: journal.status as 'draft' | 'published',
        profile,
        likes_count: likesCount || 0,
        comments_count: commentsCount || 0,
        is_liked: isLiked,
      } as Journal;
    },
    enabled: !!id,
  });
}

export function useMyJournals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-journals', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('journals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(j => ({ ...j, status: j.status as 'draft' | 'published' })) as Journal[];
    },
    enabled: !!user,
  });
}

export function useCreateJournal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { title: string; content: string; excerpt?: string; status: 'draft' | 'published' }) => {
      if (!user) throw new Error('Not authenticated');

      const { data: journal, error } = await supabase
        .from('journals')
        .insert({
          user_id: user.id,
          title: data.title,
          content: data.content,
          excerpt: data.excerpt || data.content.substring(0, 200),
          status: data.status,
        })
        .select()
        .single();

      if (error) throw error;
      return journal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
      queryClient.invalidateQueries({ queryKey: ['my-journals'] });
    },
  });
}

export function useUpdateJournal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title?: string; content?: string; excerpt?: string; status?: 'draft' | 'published' }) => {
      const { data: journal, error } = await supabase
        .from('journals')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return journal;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
      queryClient.invalidateQueries({ queryKey: ['my-journals'] });
      queryClient.invalidateQueries({ queryKey: ['journal', variables.id] });
    },
  });
}

export function useDeleteJournal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('journals').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
      queryClient.invalidateQueries({ queryKey: ['my-journals'] });
    },
  });
}

export function useLikeJournal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ journalId, isLiked }: { journalId: string; isLiked: boolean }) => {
      if (!user) throw new Error('Not authenticated');

      if (isLiked) {
        const { error } = await supabase
          .from('journal_likes')
          .delete()
          .eq('journal_id', journalId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('journal_likes')
          .insert({ journal_id: journalId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
      queryClient.invalidateQueries({ queryKey: ['journal', variables.journalId] });
    },
  });
}

export function useJournalComments(journalId: string) {
  return useQuery({
    queryKey: ['journal-comments', journalId],
    queryFn: async () => {
      const { data: comments, error } = await supabase
        .from('journal_comments')
        .select('*')
        .eq('journal_id', journalId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch profiles
      const userIds = [...new Set(comments.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, username, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return comments.map(comment => ({
        ...comment,
        profile: profileMap.get(comment.user_id) || null,
      })) as JournalComment[];
    },
    enabled: !!journalId,
  });
}

export function useAddJournalComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ journalId, content }: { journalId: string; content: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('journal_comments')
        .insert({
          journal_id: journalId,
          user_id: user.id,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['journal-comments', variables.journalId] });
      queryClient.invalidateQueries({ queryKey: ['journal', variables.journalId] });
      queryClient.invalidateQueries({ queryKey: ['journals'] });
    },
  });
}

export function useDeleteJournalComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, journalId }: { commentId: string; journalId: string }) => {
      const { error } = await supabase
        .from('journal_comments')
        .delete()
        .eq('id', commentId);
      if (error) throw error;
      return journalId;
    },
    onSuccess: (journalId) => {
      queryClient.invalidateQueries({ queryKey: ['journal-comments', journalId] });
      queryClient.invalidateQueries({ queryKey: ['journal', journalId] });
      queryClient.invalidateQueries({ queryKey: ['journals'] });
    },
  });
}

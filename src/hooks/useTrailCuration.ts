import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';
import { toast } from 'sonner';

interface PoemForCuration {
  id: string;
  title: string | null;
  content: string;
  tags: string[];
  created_at: string;
  user_id: string;
  poet?: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export function usePoemsForCuration(filters: {
  search?: string;
  tag?: string;
  poetId?: string;
  sortBy?: 'recent' | 'popular';
}) {
  return useQuery({
    queryKey: ['poems-for-curation', filters],
    queryFn: async () => {
      let query = supabase
        .from('poems')
        .select('id, title, content, tags, created_at, user_id')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(50);

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }

      if (filters.tag) {
        query = query.contains('tags', [filters.tag]);
      }

      if (filters.poetId) {
        query = query.eq('user_id', filters.poetId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch poet profiles
      const poemsWithPoets = await Promise.all(
        (data || []).map(async (poem) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, display_name, avatar_url')
            .eq('user_id', poem.user_id)
            .single();

          return {
            ...poem,
            poet: profile || undefined,
          } as PoemForCuration;
        })
      );

      // Sort by popularity if needed (by upvote count)
      if (filters.sortBy === 'popular') {
        const poemsWithCounts = await Promise.all(
          poemsWithPoets.map(async (poem) => {
            const { count } = await supabase
              .from('poem_upvotes')
              .select('*', { count: 'exact', head: true })
              .eq('poem_id', poem.id);
            return { ...poem, upvoteCount: count || 0 };
          })
        );
        poemsWithCounts.sort((a, b) => b.upvoteCount - a.upvoteCount);
        return poemsWithCounts;
      }

      return poemsWithPoets;
    },
  });
}

export function useAddPoemToTrail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ trailId, poemId }: { trailId: string; poemId: string }) => {
      // Get current max step order
      const { data: existingSteps } = await supabase
        .from('trail_steps')
        .select('step_order')
        .eq('trail_id', trailId)
        .order('step_order', { ascending: false })
        .limit(1);

      const nextOrder = (existingSteps?.[0]?.step_order || 0) + 1;

      const { data, error } = await supabase
        .from('trail_steps')
        .insert({
          trail_id: trailId,
          poem_id: poemId,
          step_order: nextOrder,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trail-steps', variables.trailId] });
      queryClient.invalidateQueries({ queryKey: ['trails'] });
      queryClient.invalidateQueries({ queryKey: ['my-trails'] });
      toast.success('Poem added to trail!');
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('This poem is already in the trail');
      } else {
        toast.error('Failed to add poem to trail');
      }
      console.error(error);
    },
  });
}

export function useRemovePoemFromTrail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ stepId, trailId }: { stepId: string; trailId: string }) => {
      const { error } = await supabase
        .from('trail_steps')
        .delete()
        .eq('id', stepId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trail-steps', variables.trailId] });
      queryClient.invalidateQueries({ queryKey: ['trails'] });
      queryClient.invalidateQueries({ queryKey: ['my-trails'] });
      toast.success('Poem removed from trail');
    },
    onError: (error) => {
      toast.error('Failed to remove poem');
      console.error(error);
    },
  });
}

export function useReorderTrailSteps() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ trailId, stepIds }: { trailId: string; stepIds: string[] }) => {
      // Update each step's order
      const updates = stepIds.map((id, index) =>
        supabase
          .from('trail_steps')
          .update({ step_order: index + 1 })
          .eq('id', id)
      );

      await Promise.all(updates);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trail-steps', variables.trailId] });
      toast.success('Order updated');
    },
    onError: (error) => {
      toast.error('Failed to reorder');
      console.error(error);
    },
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';
import { Trail, TrailCategory } from '@/types/trail';
import { toast } from 'sonner';

export function useTrails(category?: TrailCategory) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trails', category],
    queryFn: async () => {
      let query = supabase
        .from('trails')
        .select(`
          *,
          profiles!trails_user_id_fkey (
            user_id,
            username,
            display_name,
            avatar_url
          ),
          trail_steps (count)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        // Handle the join error gracefully
        const { data: basicData, error: basicError } = await supabase
          .from('trails')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (basicError) throw basicError;
        
        // Fetch step counts separately
        const trailsWithCounts = await Promise.all(
          (basicData || []).map(async (trail) => {
            const { count } = await supabase
              .from('trail_steps')
              .select('*', { count: 'exact', head: true })
              .eq('trail_id', trail.id);

            const { data: profile } = await supabase
              .from('profiles')
              .select('user_id, username, display_name, avatar_url')
              .eq('user_id', trail.user_id)
              .single();

            return {
              ...trail,
              step_count: count || 0,
              curator: profile || undefined,
            } as Trail;
          })
        );

        return trailsWithCounts;
      }

      return (data || []).map((trail: any) => ({
        ...trail,
        step_count: trail.trail_steps?.[0]?.count || 0,
        curator: trail.profiles || undefined,
      })) as Trail[];
    },
  });
}

export function useMyTrails() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-trails', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('trails')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch step counts
      const trailsWithCounts = await Promise.all(
        (data || []).map(async (trail) => {
          const { count } = await supabase
            .from('trail_steps')
            .select('*', { count: 'exact', head: true })
            .eq('trail_id', trail.id);

          return {
            ...trail,
            step_count: count || 0,
          } as Trail;
        })
      );

      return trailsWithCounts;
    },
    enabled: !!user,
  });
}

export function useCreateTrail() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (trail: {
      title: string;
      description?: string;
      cover_url?: string;
      category: TrailCategory;
      mood?: string;
      curation_note?: string;
      status?: 'draft' | 'published';
    }) => {
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('trails')
        .insert({
          ...trail,
          user_id: user.id,
          status: trail.status || 'draft',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trails'] });
      queryClient.invalidateQueries({ queryKey: ['my-trails'] });
      toast.success('Trail created!');
    },
    onError: (error) => {
      toast.error('Failed to create trail');
      console.error(error);
    },
  });
}

export function useUpdateTrail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Trail> & { id: string }) => {
      const { data, error } = await supabase
        .from('trails')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trails'] });
      queryClient.invalidateQueries({ queryKey: ['my-trails'] });
      queryClient.invalidateQueries({ queryKey: ['trail', data.id] });
      toast.success('Trail updated!');
    },
    onError: (error) => {
      toast.error('Failed to update trail');
      console.error(error);
    },
  });
}

export function useDeleteTrail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trailId: string) => {
      const { error } = await supabase
        .from('trails')
        .delete()
        .eq('id', trailId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trails'] });
      queryClient.invalidateQueries({ queryKey: ['my-trails'] });
      toast.success('Trail deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete trail');
      console.error(error);
    },
  });
}

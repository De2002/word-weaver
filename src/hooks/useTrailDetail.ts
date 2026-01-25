import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';
import { Trail, TrailStep, TrailProgress, TrailReview } from '@/types/trail';
import { toast } from 'sonner';

export function useTrailDetail(trailId: string) {
  return useQuery({
    queryKey: ['trail', trailId],
    queryFn: async () => {
      // Fetch trail
      const { data: trail, error: trailError } = await supabase
        .from('trails')
        .select('*')
        .eq('id', trailId)
        .single();

      if (trailError) throw trailError;

      // Fetch curator profile
      const { data: curator } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url')
        .eq('user_id', trail.user_id)
        .single();

      // Fetch step count
      const { count } = await supabase
        .from('trail_steps')
        .select('*', { count: 'exact', head: true })
        .eq('trail_id', trailId);

      return {
        ...trail,
        step_count: count || 0,
        curator: curator || undefined,
      } as Trail;
    },
    enabled: !!trailId,
  });
}

export function useTrailSteps(trailId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trail-steps', trailId],
    queryFn: async () => {
      // Fetch steps with poems
      const { data: steps, error } = await supabase
        .from('trail_steps')
        .select(`
          *,
          poems (
            id,
            title,
            content,
            user_id
          )
        `)
        .eq('trail_id', trailId)
        .order('step_order', { ascending: true });

      if (error) throw error;

      // Fetch poet profiles and reactions for each step
      const stepsWithDetails = await Promise.all(
        (steps || []).map(async (step: any) => {
          // Get poet profile
          const { data: poet } = await supabase
            .from('profiles')
            .select('username, display_name, avatar_url')
            .eq('user_id', step.poems?.user_id)
            .single();

          // Get reaction counts
          const { data: reactions } = await supabase
            .from('trail_step_reactions')
            .select('emoji')
            .eq('trail_step_id', step.id);

          const reactionCounts = (reactions || []).reduce((acc: any, r: any) => {
            acc[r.emoji] = (acc[r.emoji] || 0) + 1;
            return acc;
          }, {});

          // Get user's reactions if logged in
          let userReactions: string[] = [];
          if (user) {
            const { data: userReactionData } = await supabase
              .from('trail_step_reactions')
              .select('emoji')
              .eq('trail_step_id', step.id)
              .eq('user_id', user.id);

            userReactions = (userReactionData || []).map((r: any) => r.emoji);
          }

          return {
            ...step,
            poem: step.poems ? {
              ...step.poems,
              poet: poet || undefined,
            } : undefined,
            reactions: Object.entries(reactionCounts).map(([emoji, count]) => ({
              emoji,
              count: count as number,
            })),
            user_reactions: userReactions,
          } as TrailStep;
        })
      );

      return stepsWithDetails;
    },
    enabled: !!trailId,
  });
}

export function useTrailProgress(trailId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trail-progress', trailId, user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('trail_progress')
        .select('*')
        .eq('trail_id', trailId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as TrailProgress | null;
    },
    enabled: !!trailId && !!user,
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ trailId, currentStep, completed }: {
      trailId: string;
      currentStep: number;
      completed?: boolean;
    }) => {
      if (!user) throw new Error('Must be logged in');

      const { data: existing } = await supabase
        .from('trail_progress')
        .select('id')
        .eq('trail_id', trailId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('trail_progress')
          .update({
            current_step: currentStep,
            completed: completed || false,
            completed_at: completed ? new Date().toISOString() : null,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('trail_progress')
          .insert({
            trail_id: trailId,
            user_id: user.id,
            current_step: currentStep,
            completed: completed || false,
            completed_at: completed ? new Date().toISOString() : null,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trail-progress', variables.trailId] });
    },
  });
}

export function useToggleStepReaction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ stepId, emoji, trailId }: {
      stepId: string;
      emoji: string;
      trailId: string;
    }) => {
      if (!user) throw new Error('Must be logged in');

      // Check if reaction exists
      const { data: existing } = await supabase
        .from('trail_step_reactions')
        .select('id')
        .eq('trail_step_id', stepId)
        .eq('user_id', user.id)
        .eq('emoji', emoji)
        .maybeSingle();

      if (existing) {
        // Remove reaction
        const { error } = await supabase
          .from('trail_step_reactions')
          .delete()
          .eq('id', existing.id);

        if (error) throw error;
        return { added: false };
      } else {
        // Add reaction
        const { error } = await supabase
          .from('trail_step_reactions')
          .insert({
            trail_step_id: stepId,
            user_id: user.id,
            emoji,
          });

        if (error) throw error;
        return { added: true };
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trail-steps', variables.trailId] });
    },
  });
}

export function useTrailReviews(trailId: string) {
  return useQuery({
    queryKey: ['trail-reviews', trailId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trail_reviews')
        .select('*')
        .eq('trail_id', trailId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch reviewer profiles
      const reviewsWithProfiles = await Promise.all(
        (data || []).map(async (review: any) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, display_name, avatar_url')
            .eq('user_id', review.user_id)
            .single();

          return {
            ...review,
            reviewer: profile || undefined,
          } as TrailReview;
        })
      );

      return reviewsWithProfiles;
    },
    enabled: !!trailId,
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ trailId, comment, favoriteStepId, emotion }: {
      trailId: string;
      comment?: string;
      favoriteStepId?: string;
      emotion?: string;
    }) => {
      if (!user) throw new Error('Must be logged in');

      const { data: existing } = await supabase
        .from('trail_reviews')
        .select('id')
        .eq('trail_id', trailId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('trail_reviews')
          .update({
            comment,
            favorite_step_id: favoriteStepId,
            emotion,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('trail_reviews')
          .insert({
            trail_id: trailId,
            user_id: user.id,
            comment,
            favorite_step_id: favoriteStepId,
            emotion,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trail-reviews', variables.trailId] });
      toast.success('Review submitted!');
    },
    onError: (error) => {
      toast.error('Failed to submit review');
      console.error(error);
    },
  });
}

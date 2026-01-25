import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';
import { Introduction, ReactionEmoji } from '@/types/introduction';
import { toast } from 'sonner';

export function useIntroductions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: introductions = [], isLoading, error } = useQuery({
    queryKey: ['introductions'],
    queryFn: async () => {
      // Fetch introductions with profiles
      const { data: intros, error: introsError } = await supabase
        .from('introductions')
        .select('*')
        .order('created_at', { ascending: false });

      if (introsError) throw introsError;

      // Fetch profiles for all users
      const userIds = [...new Set(intros.map(i => i.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, username, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Fetch all reactions
      const introIds = intros.map(i => i.id);
      const { data: reactions } = await supabase
        .from('introduction_reactions')
        .select('*')
        .in('introduction_id', introIds);

      // Calculate reaction counts and user reactions
      const result: Introduction[] = intros.map(intro => {
        const introReactions = reactions?.filter(r => r.introduction_id === intro.id) || [];
        const reactionCounts = new Map<string, number>();
        const userReactions: string[] = [];

        introReactions.forEach(r => {
          reactionCounts.set(r.emoji, (reactionCounts.get(r.emoji) || 0) + 1);
          if (r.user_id === user?.id) {
            userReactions.push(r.emoji);
          }
        });

        return {
          ...intro,
          profile: profileMap.get(intro.user_id),
          reactions: Array.from(reactionCounts.entries()).map(([emoji, count]) => ({ emoji, count })),
          userReactions,
        };
      });

      return result;
    },
  });

  const createIntroduction = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('Must be logged in');
      
      const { data, error } = await supabase
        .from('introductions')
        .insert({ user_id: user.id, content })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['introductions'] });
      toast.success('Welcome to the community! 👋');
    },
    onError: () => {
      toast.error('Failed to post introduction');
    },
  });

  const toggleReaction = useMutation({
    mutationFn: async ({ introductionId, emoji }: { introductionId: string; emoji: ReactionEmoji }) => {
      if (!user) throw new Error('Must be logged in');

      // Check if reaction exists
      const { data: existing } = await supabase
        .from('introduction_reactions')
        .select('id')
        .eq('introduction_id', introductionId)
        .eq('user_id', user.id)
        .eq('emoji', emoji)
        .single();

      if (existing) {
        // Remove reaction
        const { error } = await supabase
          .from('introduction_reactions')
          .delete()
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        // Add reaction
        const { error } = await supabase
          .from('introduction_reactions')
          .insert({ introduction_id: introductionId, user_id: user.id, emoji });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['introductions'] });
    },
  });

  const hasUserIntroduced = introductions.some(i => i.user_id === user?.id);

  return {
    introductions,
    isLoading,
    error,
    createIntroduction,
    toggleReaction,
    hasUserIntroduced,
  };
}

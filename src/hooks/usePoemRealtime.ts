import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to subscribe to real-time updates for a specific poem's interactions and comments.
 * Automatically invalidates relevant queries when changes occur.
 */
export function usePoemRealtime(poemId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!poemId) return;

    // Subscribe to comments changes
    const commentsChannel = supabase
      .channel(`comments-${poemId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `poem_id=eq.${poemId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['comments', poemId] });
          queryClient.invalidateQueries({ queryKey: ['comment-count', poemId] });
        }
      )
      .subscribe();

    // Subscribe to upvotes changes
    const upvotesChannel = supabase
      .channel(`upvotes-${poemId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'poem_upvotes',
          filter: `poem_id=eq.${poemId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['poem-upvote-count', poemId] });
          queryClient.invalidateQueries({ queryKey: ['poem-upvote', poemId] });
        }
      )
      .subscribe();

    // Subscribe to saves changes
    const savesChannel = supabase
      .channel(`saves-${poemId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'poem_saves',
          filter: `poem_id=eq.${poemId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['poem-save-count', poemId] });
          queryClient.invalidateQueries({ queryKey: ['poem-save', poemId] });
        }
      )
      .subscribe();

    // Subscribe to comment likes changes
    const commentLikesChannel = supabase
      .channel(`comment-likes-${poemId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comment_likes',
        },
        () => {
          // Invalidate comments to refresh like counts
          queryClient.invalidateQueries({ queryKey: ['comments', poemId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(upvotesChannel);
      supabase.removeChannel(savesChannel);
      supabase.removeChannel(commentLikesChannel);
    };
  }, [poemId, queryClient]);
}

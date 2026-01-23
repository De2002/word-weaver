import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { useAuth } from '@/context/AuthProvider';
import { toast } from '@/hooks/use-toast';

interface UseFollowResult {
  isFollowing: boolean;
  isLoading: boolean;
  toggleFollow: () => void;
  followerCount: number;
}

export function useFollow(poetUserId: string): UseFollowResult {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const currentUserId = session?.user?.id;

  // Check if current user follows this poet
  const { data: followData, isLoading: checkingFollow } = useQuery({
    queryKey: ['follow-status', currentUserId, poetUserId],
    queryFn: async () => {
      if (!currentUserId) return null;
      const { data, error } = await db
        .from('follows')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', poetUserId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentUserId && !!poetUserId && currentUserId !== poetUserId,
  });

  // Get follower count for this poet
  const { data: countData } = useQuery({
    queryKey: ['follower-count', poetUserId],
    queryFn: async () => {
      const { count, error } = await db
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', poetUserId);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!poetUserId,
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      if (!currentUserId) throw new Error('Must be logged in to follow');
      
      const { error } = await db
        .from('follows')
        .insert({ follower_id: currentUserId, following_id: poetUserId });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-status', currentUserId, poetUserId] });
      queryClient.invalidateQueries({ queryKey: ['follower-count', poetUserId] });
      queryClient.invalidateQueries({ queryKey: ['following-poems'] });
      toast({ title: 'Following!', description: 'You are now following this poet.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: async () => {
      if (!currentUserId) throw new Error('Must be logged in to unfollow');
      
      const { error } = await db
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', poetUserId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-status', currentUserId, poetUserId] });
      queryClient.invalidateQueries({ queryKey: ['follower-count', poetUserId] });
      queryClient.invalidateQueries({ queryKey: ['following-poems'] });
      toast({ title: 'Unfollowed', description: 'You have unfollowed this poet.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const toggleFollow = useCallback(() => {
    if (!currentUserId) {
      toast({ 
        title: 'Sign in required', 
        description: 'Please sign in to follow poets.',
        variant: 'destructive',
      });
      return;
    }
    
    if (followData) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  }, [currentUserId, followData, followMutation, unfollowMutation]);

  return {
    isFollowing: !!followData,
    isLoading: checkingFollow || followMutation.isPending || unfollowMutation.isPending,
    toggleFollow,
    followerCount: countData || 0,
  };
}

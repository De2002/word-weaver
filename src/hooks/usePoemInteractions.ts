import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { useAuth } from '@/context/AuthProvider';
import { toast } from '@/hooks/use-toast';

interface UsePoemInteractionsResult {
  isUpvoted: boolean;
  isSaved: boolean;
  upvoteCount: number;
  saveCount: number;
  readCount: number;
  isLoading: boolean;
  toggleUpvote: () => void;
  toggleSave: () => void;
  recordRead: () => void;
}

export function usePoemInteractions(poemId: string): UsePoemInteractionsResult {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const userId = session?.user?.id;

  // Check if user has upvoted
  const { data: upvoteData, isLoading: upvoteLoading } = useQuery({
    queryKey: ['poem-upvote', poemId, userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await db
        .from('poem_upvotes')
        .select('id')
        .eq('poem_id', poemId)
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId && !!poemId,
  });

  // Check if user has saved
  const { data: saveData, isLoading: saveLoading } = useQuery({
    queryKey: ['poem-save', poemId, userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await db
        .from('poem_saves')
        .select('id')
        .eq('poem_id', poemId)
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId && !!poemId,
  });

  // Get upvote count
  const { data: upvoteCount } = useQuery({
    queryKey: ['poem-upvote-count', poemId],
    queryFn: async () => {
      const { count, error } = await db
        .from('poem_upvotes')
        .select('*', { count: 'exact', head: true })
        .eq('poem_id', poemId);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!poemId,
  });

  // Get save count
  const { data: saveCount } = useQuery({
    queryKey: ['poem-save-count', poemId],
    queryFn: async () => {
      const { count, error } = await db
        .from('poem_saves')
        .select('*', { count: 'exact', head: true })
        .eq('poem_id', poemId);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!poemId,
  });

  // Get read count
  const { data: readCount } = useQuery({
    queryKey: ['poem-read-count', poemId],
    queryFn: async () => {
      const { count, error } = await db
        .from('poem_reads')
        .select('*', { count: 'exact', head: true })
        .eq('poem_id', poemId);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!poemId,
  });

  // Upvote mutation with optimistic update
  const upvoteMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Must be logged in');
      const { error } = await db
        .from('poem_upvotes')
        .insert({ user_id: userId, poem_id: poemId });
      if (error) throw error;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['poem-upvote', poemId, userId] });
      await queryClient.cancelQueries({ queryKey: ['poem-upvote-count', poemId] });
      const previousUpvote = queryClient.getQueryData(['poem-upvote', poemId, userId]);
      const previousCount = queryClient.getQueryData(['poem-upvote-count', poemId]);
      queryClient.setQueryData(['poem-upvote', poemId, userId], { id: 'optimistic' });
      queryClient.setQueryData(['poem-upvote-count', poemId], (old: number) => (old || 0) + 1);
      return { previousUpvote, previousCount };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['poem-upvote', poemId, userId], context?.previousUpvote);
      queryClient.setQueryData(['poem-upvote-count', poemId], context?.previousCount);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['poem-upvote', poemId, userId] });
      queryClient.invalidateQueries({ queryKey: ['poem-upvote-count', poemId] });
    },
  });

  // Remove upvote mutation with optimistic update
  const removeUpvoteMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Must be logged in');
      const { error } = await db
        .from('poem_upvotes')
        .delete()
        .eq('user_id', userId)
        .eq('poem_id', poemId);
      if (error) throw error;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['poem-upvote', poemId, userId] });
      await queryClient.cancelQueries({ queryKey: ['poem-upvote-count', poemId] });
      const previousUpvote = queryClient.getQueryData(['poem-upvote', poemId, userId]);
      const previousCount = queryClient.getQueryData(['poem-upvote-count', poemId]);
      queryClient.setQueryData(['poem-upvote', poemId, userId], null);
      queryClient.setQueryData(['poem-upvote-count', poemId], (old: number) => Math.max((old || 1) - 1, 0));
      return { previousUpvote, previousCount };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['poem-upvote', poemId, userId], context?.previousUpvote);
      queryClient.setQueryData(['poem-upvote-count', poemId], context?.previousCount);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['poem-upvote', poemId, userId] });
      queryClient.invalidateQueries({ queryKey: ['poem-upvote-count', poemId] });
    },
  });

  // Save mutation with optimistic update
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Must be logged in');
      const { error } = await db
        .from('poem_saves')
        .insert({ user_id: userId, poem_id: poemId });
      if (error) throw error;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['poem-save', poemId, userId] });
      await queryClient.cancelQueries({ queryKey: ['poem-save-count', poemId] });
      const previousSave = queryClient.getQueryData(['poem-save', poemId, userId]);
      const previousCount = queryClient.getQueryData(['poem-save-count', poemId]);
      queryClient.setQueryData(['poem-save', poemId, userId], { id: 'optimistic' });
      queryClient.setQueryData(['poem-save-count', poemId], (old: number) => (old || 0) + 1);
      return { previousSave, previousCount };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['poem-save', poemId, userId], context?.previousSave);
      queryClient.setQueryData(['poem-save-count', poemId], context?.previousCount);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['poem-save', poemId, userId] });
      queryClient.invalidateQueries({ queryKey: ['poem-save-count', poemId] });
      queryClient.invalidateQueries({ queryKey: ['saved-poems'] });
    },
    onSuccess: () => {
      toast({ title: 'Saved!', description: 'Poem added to your saved collection.' });
    },
  });

  // Unsave mutation with optimistic update
  const unsaveMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Must be logged in');
      const { error } = await db
        .from('poem_saves')
        .delete()
        .eq('user_id', userId)
        .eq('poem_id', poemId);
      if (error) throw error;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['poem-save', poemId, userId] });
      await queryClient.cancelQueries({ queryKey: ['poem-save-count', poemId] });
      const previousSave = queryClient.getQueryData(['poem-save', poemId, userId]);
      const previousCount = queryClient.getQueryData(['poem-save-count', poemId]);
      queryClient.setQueryData(['poem-save', poemId, userId], null);
      queryClient.setQueryData(['poem-save-count', poemId], (old: number) => Math.max((old || 1) - 1, 0));
      return { previousSave, previousCount };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['poem-save', poemId, userId], context?.previousSave);
      queryClient.setQueryData(['poem-save-count', poemId], context?.previousCount);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['poem-save', poemId, userId] });
      queryClient.invalidateQueries({ queryKey: ['poem-save-count', poemId] });
      queryClient.invalidateQueries({ queryKey: ['saved-poems'] });
    },
    onSuccess: () => {
      toast({ title: 'Removed', description: 'Poem removed from saved collection.' });
    },
  });

  // Record read mutation
  const readMutation = useMutation({
    mutationFn: async () => {
      const { error } = await db
        .from('poem_reads')
        .upsert(
          { user_id: userId || null, poem_id: poemId },
          { onConflict: 'user_id,poem_id', ignoreDuplicates: true }
        );
      if (error && !error.message.includes('duplicate')) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poem-read-count', poemId] });
    },
  });

  const toggleUpvote = useCallback(() => {
    if (!userId) {
      toast({ 
        title: 'Sign in required', 
        description: 'Please sign in to upvote poems.',
      });
      return;
    }
    if (upvoteData) {
      removeUpvoteMutation.mutate();
    } else {
      upvoteMutation.mutate();
    }
  }, [userId, upvoteData, upvoteMutation, removeUpvoteMutation]);

  const toggleSave = useCallback(() => {
    if (!userId) {
      toast({ 
        title: 'Sign in required', 
        description: 'Please sign in to save poems.',
      });
      return;
    }
    if (saveData) {
      unsaveMutation.mutate();
    } else {
      saveMutation.mutate();
    }
  }, [userId, saveData, saveMutation, unsaveMutation]);

  const recordRead = useCallback(() => {
    readMutation.mutate();
  }, [readMutation]);

  return {
    isUpvoted: !!upvoteData,
    isSaved: !!saveData,
    upvoteCount: upvoteCount || 0,
    saveCount: saveCount || 0,
    readCount: readCount || 0,
    isLoading: upvoteLoading || saveLoading,
    toggleUpvote,
    toggleSave,
    recordRead,
  };
}

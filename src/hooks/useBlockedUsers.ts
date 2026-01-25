import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { useAuth } from '@/context/AuthProvider';

export interface BlockedUser {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

export function useBlockedUsers() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['blocked-users', user?.id],
    queryFn: async (): Promise<BlockedUser[]> => {
      if (!user) return [];

      const { data, error } = await db
        .from('blocked_users')
        .select('*')
        .eq('blocker_id', user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useIsBlocked(userId: string) {
  const { data: blockedUsers } = useBlockedUsers();
  return blockedUsers?.some((b) => b.blocked_id === userId) ?? false;
}

export function useBlockUser() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blockedId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await db
        .from('blocked_users')
        .insert({
          blocker_id: user.id,
          blocked_id: blockedId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-users', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
    },
  });
}

export function useUnblockUser() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blockedId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await db
        .from('blocked_users')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', blockedId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-users', user?.id] });
    },
  });
}

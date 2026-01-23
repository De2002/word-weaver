import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { useAuth } from '@/context/AuthProvider';

export interface Notification {
  id: string;
  userId: string;
  type: 'follow' | 'upvote' | 'comment' | 'reply';
  actorId: string;
  poemId: string | null;
  commentId: string | null;
  isRead: boolean;
  createdAt: string;
  actor: {
    name: string;
    username: string;
    avatar: string;
  };
  poem?: {
    id: string;
    title: string | null;
  };
}

interface DbNotification {
  id: string;
  user_id: string;
  type: string;
  actor_id: string;
  poem_id: string | null;
  comment_id: string | null;
  is_read: boolean;
  created_at: string;
}

interface DbProfile {
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
}

interface DbPoem {
  id: string;
  title: string | null;
}

interface UseNotificationsResult {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  refetch: () => void;
}

export function useNotifications(): UseNotificationsResult {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const userId = session?.user?.id;

  // Fetch notifications
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data: notificationsData, error: notificationsError } = await db
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (notificationsError) throw notificationsError;
      if (!notificationsData || notificationsData.length === 0) return [];

      // Get unique actor IDs and fetch profiles
      const actorIds = [...new Set(notificationsData.map((n: DbNotification) => n.actor_id))];
      const { data: profilesData } = await db
        .from('profiles')
        .select('user_id, username, display_name, avatar_url')
        .in('user_id', actorIds);

      const profilesMap = new Map<string, DbProfile>();
      (profilesData || []).forEach((p: DbProfile) => {
        profilesMap.set(p.user_id, p);
      });

      // Get poem titles for poem-related notifications
      const poemIds = notificationsData
        .filter((n: DbNotification) => n.poem_id)
        .map((n: DbNotification) => n.poem_id as string);
      
      const poemsMap = new Map<string, DbPoem>();
      if (poemIds.length > 0) {
        const { data: poemsData } = await db
          .from('poems')
          .select('id, title')
          .in('id', poemIds);

        (poemsData || []).forEach((p: DbPoem) => {
          poemsMap.set(p.id, p);
        });
      }

      // Transform notifications
      const transformedNotifications: Notification[] = notificationsData.map((n: DbNotification) => {
        const actorProfile = profilesMap.get(n.actor_id);
        const poem = n.poem_id ? poemsMap.get(n.poem_id) : undefined;

        return {
          id: n.id,
          userId: n.user_id,
          type: n.type as Notification['type'],
          actorId: n.actor_id,
          poemId: n.poem_id,
          commentId: n.comment_id,
          isRead: n.is_read,
          createdAt: n.created_at,
          actor: {
            name: actorProfile?.display_name || actorProfile?.username || 'Someone',
            username: actorProfile?.username || 'unknown',
            avatar: actorProfile?.avatar_url || '',
          },
          poem: poem ? { id: poem.id, title: poem.title } : undefined,
        };
      });

      return transformedNotifications;
    },
    enabled: !!userId,
    refetchInterval: 30000, // Poll every 30 seconds for new notifications
  });

  // Get unread count
  const { data: unreadCount } = useQuery({
    queryKey: ['notifications-unread-count', userId],
    queryFn: async () => {
      if (!userId) return 0;
      const { count, error } = await db
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId,
    refetchInterval: 30000,
  });

  // Mark single notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await db
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count', userId] });
    },
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not authenticated');
      const { error } = await db
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count', userId] });
    },
  });

  // Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await db
        .from('notifications')
        .delete()
        .eq('id', notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count', userId] });
    },
  });

  const markAsRead = useCallback((notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  }, [markAsReadMutation]);

  const markAllAsRead = useCallback(() => {
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation]);

  const deleteNotification = useCallback((notificationId: string) => {
    deleteNotificationMutation.mutate(notificationId);
  }, [deleteNotificationMutation]);

  return {
    notifications: data || [],
    unreadCount: unreadCount || 0,
    isLoading,
    error: error as Error | null,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch,
  };
}

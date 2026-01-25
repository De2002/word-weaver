import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { useAuth } from '@/context/AuthProvider';
import { Message, Conversation } from '@/types/message';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useConversations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async (): Promise<Conversation[]> => {
      if (!user) return [];

      // Get all messages involving the user
      const { data: messages, error } = await db
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!messages || messages.length === 0) return [];

      // Group by conversation partner
      const conversationsMap = new Map<string, {
        partner_id: string;
        last_message: string;
        last_message_time: string;
        unread_count: number;
      }>();

      messages.forEach((msg: any) => {
        const partnerId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
        
        if (!conversationsMap.has(partnerId)) {
          conversationsMap.set(partnerId, {
            partner_id: partnerId,
            last_message: msg.content,
            last_message_time: msg.created_at,
            unread_count: 0,
          });
        }
        
        // Count unread messages
        if (msg.recipient_id === user.id && !msg.is_read) {
          const conv = conversationsMap.get(partnerId)!;
          conv.unread_count++;
        }
      });

      // Fetch partner profiles
      const partnerIds = Array.from(conversationsMap.keys());
      const { data: profiles } = await db
        .from('profiles')
        .select('user_id, username, display_name, avatar_url')
        .in('user_id', partnerIds);

      interface ProfileData {
        user_id: string;
        username: string | null;
        display_name: string | null;
        avatar_url: string | null;
      }

      const profileMap = new Map((profiles as ProfileData[] | null)?.map((p) => [p.user_id, p]) || []);

      return Array.from(conversationsMap.values()).map((conv) => {
        const profile = profileMap.get(conv.partner_id);
        return {
          ...conv,
          partner_username: profile?.username || null,
          partner_display_name: profile?.display_name || null,
          partner_avatar: profile?.avatar_url || null,
        };
      });
    },
    enabled: !!user,
  });
}

export function useConversation(partnerId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const messagesQuery = useQuery({
    queryKey: ['conversation', user?.id, partnerId],
    queryFn: async (): Promise<Message[]> => {
      if (!user || !partnerId) return [];

      const { data, error } = await db
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!partnerId,
  });

  // Real-time subscription
  useEffect(() => {
    if (!user || !partnerId) return;

    const channel = supabase
      .channel(`messages-${user.id}-${partnerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const msg = payload.new as Message;
          // Only add if it's part of this conversation
          if (
            (msg.sender_id === user.id && msg.recipient_id === partnerId) ||
            (msg.sender_id === partnerId && msg.recipient_id === user.id)
          ) {
            queryClient.invalidateQueries({ queryKey: ['conversation', user.id, partnerId] });
            queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, partnerId, queryClient]);

  return messagesQuery;
}

export function useSendMessage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recipientId, content }: { recipientId: string; content: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await db
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content: content.trim(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversation', user?.id, variables.recipientId] });
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
    },
  });
}

export function useMarkAsRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageIds: string[]) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await db
        .from('messages')
        .update({ is_read: true })
        .in('id', messageIds)
        .eq('recipient_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
    },
  });
}

export function useUnreadCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['unread-messages', user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const { count, error } = await db
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });
}

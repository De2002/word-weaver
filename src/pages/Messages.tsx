import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, MessageCircle, Ban } from 'lucide-react';
import { useConversations, useConversation, useSendMessage, useMarkAsRead } from '@/hooks/useMessages';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { useAuth } from '@/context/AuthProvider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { MessageActions } from '@/components/messages/MessageActions';
import { db } from '@/lib/db';
import { useQuery } from '@tanstack/react-query';

function ConversationList({ onSelect }: { onSelect: (partnerId: string) => void }) {
  const { data: conversations, isLoading } = useConversations();
  const { data: blockedUsers } = useBlockedUsers();

  const blockedIds = new Set(blockedUsers?.map((b) => b.blocked_id) || []);

  // Filter out blocked users from conversation list
  const visibleConversations = conversations?.filter((c) => !blockedIds.has(c.partner_id));

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!visibleConversations || visibleConversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-medium mb-2">No messages yet</h3>
        <p className="text-sm text-muted-foreground">
          Start a conversation by visiting a poet's profile
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {visibleConversations.map((conv) => (
        <button
          key={conv.partner_id}
          onClick={() => onSelect(conv.partner_id)}
          className="w-full flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors text-left"
        >
          <Avatar className="h-12 w-12">
            <AvatarImage src={conv.partner_avatar || ''} />
            <AvatarFallback className="bg-secondary">
              {(conv.partner_display_name || conv.partner_username || '?').charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-medium truncate">
                {conv.partner_display_name || conv.partner_username || 'Unknown'}
              </span>
              {conv.unread_count > 0 && (
                <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                  {conv.unread_count}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">{conv.last_message}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

function ConversationView({ partnerId, onBack }: { partnerId: string; onBack: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: messages, isLoading } = useConversation(partnerId);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();
  const { data: blockedUsers } = useBlockedUsers();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch partner profile
  const { data: partnerProfile } = useQuery({
    queryKey: ['profile', partnerId],
    queryFn: async () => {
      const { data, error } = await db
        .from('profiles')
        .select('user_id, username, display_name, avatar_url')
        .eq('user_id', partnerId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!partnerId,
  });

  const partnerName = partnerProfile?.display_name || partnerProfile?.username || 'Unknown';
  const isBlocked = blockedUsers?.some((b) => b.blocked_id === partnerId) ?? false;

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages?.length]);

  // Mark unread messages as read
  useEffect(() => {
    if (!messages || !user) return;
    const unreadIds = messages
      .filter((m) => m.recipient_id === user.id && !m.is_read)
      .map((m) => m.id);
    if (unreadIds.length > 0) {
      markAsRead.mutate(unreadIds);
    }
  }, [messages, user]);

  const handleSend = () => {
    if (!newMessage.trim() || isBlocked) return;
    sendMessage.mutate({ recipientId: partnerId, content: newMessage });
    setNewMessage('');
  };

  const handleBlocked = () => {
    onBack();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-secondary rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Link to={`/poet/${partnerId}`} className="flex items-center gap-2 flex-1 min-w-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src={partnerProfile?.avatar_url || ''} />
            <AvatarFallback className="bg-secondary text-sm">
              {partnerName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium truncate">{partnerName}</span>
        </Link>
      </div>

      {/* Blocked banner */}
      {isBlocked && (
        <div className="bg-muted p-3 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Ban className="h-4 w-4" />
          You have blocked this user
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className={cn("h-10 w-48", i % 2 === 0 ? "" : "ml-auto")} />
            ))}
          </div>
        ) : (
          messages?.map((msg) => {
            const isOwn = msg.sender_id === user?.id;
            return (
              <div
                key={msg.id}
                className={cn(
                  "group flex items-start gap-1",
                  isOwn ? "flex-row-reverse" : ""
                )}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2",
                    isOwn
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary"
                  )}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
                <MessageActions
                  messageId={msg.id}
                  senderId={msg.sender_id}
                  senderName={partnerName}
                  isOwnMessage={isOwn}
                  onBlocked={handleBlocked}
                />
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        {isBlocked ? (
          <p className="text-center text-sm text-muted-foreground">
            You cannot send messages to blocked users
          </p>
        ) : (
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!newMessage.trim() || sendMessage.isPending}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Messages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedPartner = searchParams.get('with');

  const handleSelectConversation = (partnerId: string) => {
    setSearchParams({ with: partnerId });
  };

  const handleBack = () => {
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      {!selectedPartner && (
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center gap-3 px-4 h-14 max-w-2xl mx-auto">
            <Link to="/more" className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="font-semibold">Messages</h1>
          </div>
        </header>
      )}

      <main className="flex-1 max-w-2xl mx-auto w-full">
        {selectedPartner ? (
          <ConversationView partnerId={selectedPartner} onBack={handleBack} />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <ConversationList onSelect={handleSelectConversation} />
          </motion.div>
        )}
      </main>
    </div>
  );
}

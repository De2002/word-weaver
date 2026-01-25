export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    user_id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
  recipient?: {
    user_id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface Conversation {
  partner_id: string;
  partner_username: string | null;
  partner_display_name: string | null;
  partner_avatar: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

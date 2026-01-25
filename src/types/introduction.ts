export interface Introduction {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profile?: {
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
  reactions?: ReactionCount[];
  userReactions?: string[];
}

export interface ReactionCount {
  emoji: string;
  count: number;
}

export type ReactionEmoji = '👋' | '🎉' | '❤️';

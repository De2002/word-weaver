export interface Journal {
  id: string;
  user_id: string;
  title: string;
  content: string;
  excerpt: string | null;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
  // Joined data
  profile?: {
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
}

export interface JournalComment {
  id: string;
  journal_id: string;
  user_id: string;
  content: string;
  created_at: string;
  // Joined data
  profile?: {
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

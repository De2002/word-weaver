export type QACategory =
  | 'writing-techniques'
  | 'publishing-advice'
  | 'poetry-feedback'
  | 'spoken-word'
  | 'editing-revision'
  | 'poetry-books'
  | 'platform'
  | 'general';

export const QA_CATEGORIES: { value: QACategory; label: string }[] = [
  { value: 'writing-techniques', label: 'Writing Techniques' },
  { value: 'publishing-advice', label: 'Publishing Advice' },
  { value: 'poetry-feedback', label: 'Poetry Feedback' },
  { value: 'spoken-word', label: 'Spoken Word & Performance' },
  { value: 'editing-revision', label: 'Editing & Revision' },
  { value: 'poetry-books', label: 'Poetry Books' },
  { value: 'platform', label: 'Platform' },
  { value: 'general', label: 'General' },
];

export interface QAPoet {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  is_pro: boolean;
}

export interface QAAnswer {
  id: string;
  question_id: string;
  user_id: string;
  content: string;
  is_accepted: boolean;
  vote_count: number;
  has_voted: boolean;
  poet: QAPoet;
  created_at: string;
  updated_at: string;
}

export interface QAQuestion {
  id: string;
  slug: string;
  user_id: string;
  title: string;
  details: string | null;
  category: QACategory;
  is_featured: boolean;
  views: number;
  accepted_answer_id: string | null;
  answer_count: number;
  poet: QAPoet;
  created_at: string;
  updated_at: string;
}

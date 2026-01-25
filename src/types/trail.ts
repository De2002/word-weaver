export type TrailCategory = 'theme' | 'emotion' | 'challenge';
export type TrailStatus = 'draft' | 'published';

export interface Trail {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  category: TrailCategory;
  mood: string | null;
  curation_note: string | null;
  status: TrailStatus;
  created_at: string;
  updated_at: string;
  // Computed fields
  step_count?: number;
  curator?: {
    user_id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface TrailStep {
  id: string;
  trail_id: string;
  poem_id: string;
  step_order: number;
  created_at: string;
  // Joined poem data
  poem?: {
    id: string;
    title: string | null;
    content: string;
    user_id: string;
    poet?: {
      username: string | null;
      display_name: string | null;
      avatar_url: string | null;
    };
  };
  // Reaction counts
  reactions?: TrailStepReactionCount[];
  user_reactions?: string[];
}

export interface TrailStepReaction {
  id: string;
  trail_step_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface TrailStepReactionCount {
  emoji: string;
  count: number;
}

export interface TrailProgress {
  id: string;
  trail_id: string;
  user_id: string;
  current_step: number;
  completed: boolean;
  started_at: string;
  completed_at: string | null;
  updated_at: string;
}

export interface TrailReview {
  id: string;
  trail_id: string;
  user_id: string;
  comment: string | null;
  favorite_step_id: string | null;
  emotion: string | null;
  created_at: string;
  // Joined data
  reviewer?: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export const TRAIL_REACTION_EMOJIS = ['❤️', '💭', '🌧️', '✨', '😮'] as const;

export const TRAIL_REACTION_LABELS: Record<string, string> = {
  '❤️': 'touched me',
  '💭': 'made me think',
  '🌧️': 'soft/sad',
  '✨': 'beautiful',
  '😮': 'surprising',
};

export const TRAIL_EMOTIONS = [
  'Moved',
  'Hopeful',
  'Melancholic',
  'Inspired',
  'Peaceful',
  'Nostalgic',
  'Reflective',
  'Comforted',
] as const;

export const TRAIL_MOODS = [
  'Sadness',
  'Hope',
  'Fear',
  'Nostalgia',
  'Anger',
  'Comfort',
  'Love',
  'Joy',
  'Longing',
  'Peace',
] as const;

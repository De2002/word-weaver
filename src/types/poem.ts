export interface Poet {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  about?: string;
  headerImage?: string;
  pinnedPoemId?: string | null;
  languages: string[];
  totalReads: number;
  totalUpvotes: number;
  totalSaves?: number;
  totalPoems: number;
  followersCount: number;
  supportLinks?: {
    buyMeACoffee?: string;
    paypal?: string;
    kofi?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
  };
  badges: Badge[];
  isFollowing?: boolean;
}

export interface Poem {
  id: string;
  slug?: string;
  title?: string;
  text: string;
  poet: Poet;
  imageUrl?: string;
  audioUrl?: string;
  language: string;
  tags: string[];
  upvotes: number;
  comments: number;
  saves: number;
  reads: number;
  createdAt: string;
  isUpvoted?: boolean;
  isSaved?: boolean;
  copyright?: string | null;
}

export type BadgeType = 'trending' | 'new' | 'rising';

export interface Badge {
  type: BadgeType;
  label: string;
  expiresAt?: string;
}

import { Poem } from '@/types/poem';

/**
 * Reddit-inspired ranking algorithm for poems
 * Prioritizes: upvotes, comments, saves
 * Boosts: New Voices (7-14 days), Rising Poets
 * Minimizes influence of follower counts
 */

const HOUR_MS = 3600000;
const DAY_MS = HOUR_MS * 24;

interface RankingWeights {
  upvotes: number;
  comments: number;
  saves: number;
  newVoiceBoost: number;
  risingBoost: number;
  decayFactor: number;
}

const DEFAULT_WEIGHTS: RankingWeights = {
  upvotes: 1,
  comments: 2,      // Comments weighted higher as they show deeper engagement
  saves: 1.5,       // Saves show intent to revisit
  newVoiceBoost: 1.5,   // 50% boost for new voices (7-14 days)
  risingBoost: 1.3,     // 30% boost for rising poets
  decayFactor: 1.8,     // Time decay exponent (higher = faster decay)
};

/**
 * Calculate hot score for a poem (like Reddit's hot algorithm)
 */
export function calculateHotScore(poem: Poem, weights = DEFAULT_WEIGHTS): number {
  const now = Date.now();
  const createdAt = new Date(poem.createdAt).getTime();
  const ageHours = Math.max((now - createdAt) / HOUR_MS, 0.1);
  
  // Engagement score
  const engagementScore = 
    poem.upvotes * weights.upvotes +
    poem.comments * weights.comments +
    poem.saves * weights.saves;
  
  // Apply poet badge boosts (not follower-based)
  let boostMultiplier = 1;
  const badges = poem.poet.badges.map(b => b.type);
  
  if (badges.includes('new')) {
    boostMultiplier *= weights.newVoiceBoost;
  }
  if (badges.includes('rising')) {
    boostMultiplier *= weights.risingBoost;
  }
  
  // Time decay - newer content ranks higher
  const timeDecay = Math.pow(ageHours + 2, weights.decayFactor);
  
  // Final score
  return (engagementScore * boostMultiplier * 10000) / timeDecay;
}

/**
 * Sort poems by hot score (trending)
 */
export function sortByHot(poems: Poem[]): Poem[] {
  return [...poems].sort((a, b) => calculateHotScore(b) - calculateHotScore(a));
}

/**
 * Sort poems by new (most recent first)
 */
export function sortByNew(poems: Poem[]): Poem[] {
  return [...poems].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Sort poems by top (highest engagement)
 */
export function sortByTop(poems: Poem[]): Poem[] {
  return [...poems].sort((a, b) => {
    const scoreA = a.upvotes + a.comments * 2 + a.saves * 1.5;
    const scoreB = b.upvotes + b.comments * 2 + b.saves * 1.5;
    return scoreB - scoreA;
  });
}

/**
 * Sort poems by rising (high engagement velocity on recent poems)
 */
export function sortByRising(poems: Poem[]): Poem[] {
  const now = Date.now();
  
  return [...poems]
    .filter(poem => {
      const age = now - new Date(poem.createdAt).getTime();
      return age < 7 * DAY_MS; // Only poems from last 7 days
    })
    .sort((a, b) => {
      const ageA = Math.max((now - new Date(a.createdAt).getTime()) / HOUR_MS, 1);
      const ageB = Math.max((now - new Date(b.createdAt).getTime()) / HOUR_MS, 1);
      
      // Engagement per hour
      const velocityA = (a.upvotes + a.comments + a.saves) / ageA;
      const velocityB = (b.upvotes + b.comments + b.saves) / ageB;
      
      return velocityB - velocityA;
    });
}

export type SortType = 'hot' | 'new' | 'top' | 'rising';

export function sortPoems(poems: Poem[], sortType: SortType): Poem[] {
  switch (sortType) {
    case 'hot':
      return sortByHot(poems);
    case 'new':
      return sortByNew(poems);
    case 'top':
      return sortByTop(poems);
    case 'rising':
      return sortByRising(poems);
    default:
      return sortByHot(poems);
  }
}

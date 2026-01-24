import { Poet, BadgeType } from '@/types/poem';

/**
 * Poet ranking algorithm for WordStack discovery
 * 
 * Categories:
 * - Trending: Highest engagement velocity over the past 7 days
 * - Rising: Poets with accelerating engagement (newer poets gaining traction)
 * - New Voices: Poets who joined within the last 14 days
 */

const HOUR_MS = 3600000;
const DAY_MS = HOUR_MS * 24;

export interface PoetWithMetrics extends Poet {
  createdAt: string;
  recentUpvotes: number;    // Upvotes in last 7 days
  recentReads: number;      // Reads in last 7 days
  recentComments: number;   // Comments in last 7 days
  totalEngagement: number;  // All-time engagement score
}

interface RankingWeights {
  upvotes: number;
  reads: number;
  comments: number;
  followers: number;      // Minimal weight - we don't want follower-count dominance
  decayFactor: number;    // Time decay exponent
}

const DEFAULT_WEIGHTS: RankingWeights = {
  upvotes: 2,           // High value - intentional engagement
  reads: 0.5,           // Lower weight - passive engagement
  comments: 3,          // Highest - shows deep connection
  followers: 0.1,       // Minimal - avoid popularity bias
  decayFactor: 1.5,     // Moderate decay for poets (slower than poems)
};

/**
 * Calculate trending score for a poet (engagement velocity)
 * Similar to Reddit's hot algorithm but for poet-level aggregation
 */
export function calculateTrendingScore(poet: PoetWithMetrics, weights = DEFAULT_WEIGHTS): number {
  // Recent engagement (last 7 days)
  const recentEngagement = 
    poet.recentUpvotes * weights.upvotes +
    poet.recentReads * weights.reads +
    poet.recentComments * weights.comments;
  
  // Time factor - when did most recent activity occur?
  // For trending, we want consistent recent activity
  const now = Date.now();
  const createdAt = new Date(poet.createdAt).getTime();
  const accountAgeDays = Math.max((now - createdAt) / DAY_MS, 1);
  
  // Normalize by account age to not penalize newer poets too much
  const ageNormalizer = Math.min(accountAgeDays / 7, 1); // Cap at 1 week normalization
  
  // Engagement per day (velocity)
  const engagementVelocity = recentEngagement / 7; // Per day average
  
  // Add small base from total engagement to prevent zero scores
  const baseScore = Math.log10(poet.totalEngagement + 1) * 10;
  
  return (engagementVelocity * 100) + baseScore;
}

/**
 * Calculate rising score for a poet (growth trajectory)
 * Prioritizes poets who are gaining momentum relative to their size
 */
export function calculateRisingScore(poet: PoetWithMetrics, weights = DEFAULT_WEIGHTS): number {
  const now = Date.now();
  const createdAt = new Date(poet.createdAt).getTime();
  const accountAgeDays = Math.max((now - createdAt) / DAY_MS, 1);
  
  // Recent engagement
  const recentEngagement = 
    poet.recentUpvotes * weights.upvotes +
    poet.recentReads * weights.reads +
    poet.recentComments * weights.comments;
  
  // Historical engagement (proxy from totals minus recent)
  const historicalEngagement = Math.max(poet.totalEngagement - recentEngagement, 0);
  
  // Growth ratio: how much of their total engagement is recent?
  // Higher ratio = faster growth
  const growthRatio = recentEngagement / (historicalEngagement + 1);
  
  // Boost newer accounts (accounts < 30 days get bonus)
  const newAccountBoost = accountAgeDays < 30 
    ? 1 + ((30 - accountAgeDays) / 30) * 0.5 // Up to 50% boost
    : 1;
  
  // Engagement velocity
  const velocity = recentEngagement / 7;
  
  // Rising score: growth + velocity, boosted for newer accounts
  return (growthRatio * 50 + velocity) * newAccountBoost;
}

/**
 * Determine if a poet qualifies as "New Voice"
 * Within 14 days of first published poem
 */
export function isNewVoice(poet: PoetWithMetrics): boolean {
  const now = Date.now();
  const createdAt = new Date(poet.createdAt).getTime();
  const accountAgeDays = (now - createdAt) / DAY_MS;
  
  return accountAgeDays <= 14;
}

/**
 * Assign badge to poet based on their ranking category
 */
export function assignBadge(type: 'trending' | 'rising' | 'new'): { type: BadgeType; label: string } {
  const badges = {
    trending: { type: 'trending' as BadgeType, label: 'Trending' },
    rising: { type: 'rising' as BadgeType, label: 'Rising' },
    new: { type: 'new' as BadgeType, label: 'New Voice' },
  };
  return badges[type];
}

/**
 * Sort poets by trending score
 */
export function sortByTrending(poets: PoetWithMetrics[]): PoetWithMetrics[] {
  return [...poets].sort((a, b) => calculateTrendingScore(b) - calculateTrendingScore(a));
}

/**
 * Sort poets by rising score (only poets with recent activity)
 */
export function sortByRising(poets: PoetWithMetrics[]): PoetWithMetrics[] {
  // Filter to poets with some recent engagement
  return [...poets]
    .filter(p => p.recentUpvotes > 0 || p.recentReads > 0 || p.recentComments > 0)
    .sort((a, b) => calculateRisingScore(b) - calculateRisingScore(a));
}

/**
 * Get new voices (poets who joined recently)
 * Sorted by engagement to show the most promising new poets first
 */
export function sortNewVoices(poets: PoetWithMetrics[]): PoetWithMetrics[] {
  return [...poets]
    .filter(isNewVoice)
    .sort((a, b) => {
      // Sort by recent engagement within new voices
      const scoreA = a.recentUpvotes * 2 + a.recentReads * 0.5 + a.recentComments * 3;
      const scoreB = b.recentUpvotes * 2 + b.recentReads * 0.5 + b.recentComments * 3;
      return scoreB - scoreA;
    });
}

/**
 * Main function to categorize all poets into discovery sections
 */
export function categorizePoets(poets: PoetWithMetrics[]): {
  trending: Poet[];
  rising: Poet[];
  newVoices: Poet[];
  all: Poet[];
} {
  const trending = sortByTrending(poets)
    .slice(0, 10)
    .map(p => ({ ...p, badges: [assignBadge('trending')] }));
  
  // Rising: exclude poets already in trending
  const trendingIds = new Set(trending.map(p => p.id));
  const rising = sortByRising(poets)
    .filter(p => !trendingIds.has(p.id))
    .slice(0, 10)
    .map(p => ({ ...p, badges: [assignBadge('rising')] }));
  
  // New Voices: can overlap with rising but not trending
  const newVoices = sortNewVoices(poets)
    .filter(p => !trendingIds.has(p.id))
    .slice(0, 10)
    .map(p => ({ ...p, badges: [assignBadge('new')] }));
  
  // All poets for browsing (no specific badge, sorted by total engagement)
  const all = [...poets]
    .sort((a, b) => b.totalEngagement - a.totalEngagement)
    .map(p => {
      // Assign appropriate badge if they qualify
      if (trendingIds.has(p.id)) {
        return { ...p, badges: [assignBadge('trending')] };
      }
      const risingIds = new Set(rising.map(r => r.id));
      if (risingIds.has(p.id)) {
        return { ...p, badges: [assignBadge('rising')] };
      }
      if (isNewVoice(p)) {
        return { ...p, badges: [assignBadge('new')] };
      }
      return { ...p, badges: [] };
    });
  
  return { trending, rising, newVoices, all };
}

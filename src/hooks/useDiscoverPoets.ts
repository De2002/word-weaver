import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Poet } from '@/types/poem';
import { PoetWithMetrics, categorizePoets } from '@/lib/poetRanking';

interface UseDiscoverPoetsResult {
  trendingPoets: Poet[];
  risingPoets: Poet[];
  newPoets: Poet[];
  allPoets: Poet[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Hook to fetch and rank poets for the Discover page
 * Uses real engagement data with time-decayed ranking
 */
export function useDiscoverPoets(): UseDiscoverPoetsResult {
  const [trendingPoets, setTrendingPoets] = useState<Poet[]>([]);
  const [risingPoets, setRisingPoets] = useState<Poet[]>([]);
  const [newPoets, setNewPoets] = useState<Poet[]>([]);
  const [allPoets, setAllPoets] = useState<Poet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPoets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoISO = sevenDaysAgo.toISOString();

      // Fetch all profiles with published poems
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      if (!profiles || profiles.length === 0) {
        setTrendingPoets([]);
        setRisingPoets([]);
        setNewPoets([]);
        setAllPoets([]);
        setIsLoading(false);
        return;
      }

      // Get all user IDs from profiles
      const userIds = profiles.map(p => p.user_id);

      // Fetch published poems for these users
      const { data: poems, error: poemsError } = await supabase
        .from('poems')
        .select('id, user_id, created_at')
        .eq('status', 'published')
        .in('user_id', userIds);

      if (poemsError) throw poemsError;

      // Filter to only users with published poems
      const usersWithPoems = new Set((poems || []).map(p => p.user_id));
      const activeProfiles = profiles.filter(p => usersWithPoems.has(p.user_id));

      if (activeProfiles.length === 0) {
        setTrendingPoets([]);
        setRisingPoets([]);
        setNewPoets([]);
        setAllPoets([]);
        setIsLoading(false);
        return;
      }

      // Get poem IDs for engagement queries
      const poemIds = (poems || []).map(p => p.id);

      // Fetch engagement data in parallel
      const [
        upvotesResult,
        readsResult,
        commentsResult,
        followersResult,
        recentUpvotesResult,
        recentReadsResult,
        recentCommentsResult,
      ] = await Promise.all([
        // Total upvotes per poem
        supabase
          .from('poem_upvotes')
          .select('poem_id')
          .in('poem_id', poemIds),
        // Total reads per poem
        supabase
          .from('poem_reads')
          .select('poem_id')
          .in('poem_id', poemIds),
        // Total comments per poem
        supabase
          .from('comments')
          .select('poem_id')
          .in('poem_id', poemIds),
        // Followers per user
        supabase
          .from('follows')
          .select('following_id')
          .in('following_id', userIds),
        // Recent upvotes (last 7 days)
        supabase
          .from('poem_upvotes')
          .select('poem_id, created_at')
          .in('poem_id', poemIds)
          .gte('created_at', sevenDaysAgoISO),
        // Recent reads (last 7 days)
        supabase
          .from('poem_reads')
          .select('poem_id, created_at')
          .in('poem_id', poemIds)
          .gte('created_at', sevenDaysAgoISO),
        // Recent comments (last 7 days)
        supabase
          .from('comments')
          .select('poem_id, created_at')
          .in('poem_id', poemIds)
          .gte('created_at', sevenDaysAgoISO),
      ]);

      // Create lookup maps for poem -> user
      const poemToUser = new Map<string, string>();
      (poems || []).forEach(p => poemToUser.set(p.id, p.user_id));

      // Aggregate total engagement by user
      const userUpvotes = new Map<string, number>();
      const userReads = new Map<string, number>();
      const userComments = new Map<string, number>();
      const userFollowers = new Map<string, number>();
      const userRecentUpvotes = new Map<string, number>();
      const userRecentReads = new Map<string, number>();
      const userRecentComments = new Map<string, number>();
      const userPoemCount = new Map<string, number>();
      const userFirstPoem = new Map<string, string>();

      // Count poems per user and track first poem date
      (poems || []).forEach(p => {
        userPoemCount.set(p.user_id, (userPoemCount.get(p.user_id) || 0) + 1);
        const existingFirst = userFirstPoem.get(p.user_id);
        if (!existingFirst || p.created_at < existingFirst) {
          userFirstPoem.set(p.user_id, p.created_at);
        }
      });

      // Aggregate upvotes
      (upvotesResult.data || []).forEach(u => {
        const userId = poemToUser.get(u.poem_id);
        if (userId) {
          userUpvotes.set(userId, (userUpvotes.get(userId) || 0) + 1);
        }
      });

      // Aggregate reads
      (readsResult.data || []).forEach(r => {
        const userId = poemToUser.get(r.poem_id);
        if (userId) {
          userReads.set(userId, (userReads.get(userId) || 0) + 1);
        }
      });

      // Aggregate comments
      (commentsResult.data || []).forEach(c => {
        const userId = poemToUser.get(c.poem_id);
        if (userId) {
          userComments.set(userId, (userComments.get(userId) || 0) + 1);
        }
      });

      // Aggregate followers
      (followersResult.data || []).forEach(f => {
        userFollowers.set(f.following_id, (userFollowers.get(f.following_id) || 0) + 1);
      });

      // Aggregate recent upvotes
      (recentUpvotesResult.data || []).forEach(u => {
        const userId = poemToUser.get(u.poem_id);
        if (userId) {
          userRecentUpvotes.set(userId, (userRecentUpvotes.get(userId) || 0) + 1);
        }
      });

      // Aggregate recent reads
      (recentReadsResult.data || []).forEach(r => {
        const userId = poemToUser.get(r.poem_id);
        if (userId) {
          userRecentReads.set(userId, (userRecentReads.get(userId) || 0) + 1);
        }
      });

      // Aggregate recent comments
      (recentCommentsResult.data || []).forEach(c => {
        const userId = poemToUser.get(c.poem_id);
        if (userId) {
          userRecentComments.set(userId, (userRecentComments.get(userId) || 0) + 1);
        }
      });

      // Build poet objects with metrics
      const poetsWithMetrics: PoetWithMetrics[] = activeProfiles.map(profile => {
        const totalUpvotes = userUpvotes.get(profile.user_id) || 0;
        const totalReads = userReads.get(profile.user_id) || 0;
        const totalComments = userComments.get(profile.user_id) || 0;
        
        const poet: PoetWithMetrics = {
          id: profile.user_id,
          name: profile.display_name || profile.username || 'Anonymous Poet',
          username: profile.username || 'anonymous',
          avatar: profile.avatar_url || '',
          bio: profile.bio || '',
          languages: [],
          totalReads,
          totalUpvotes,
          totalPoems: userPoemCount.get(profile.user_id) || 0,
          followersCount: userFollowers.get(profile.user_id) || 0,
          badges: [],
          createdAt: userFirstPoem.get(profile.user_id) || profile.created_at,
          recentUpvotes: userRecentUpvotes.get(profile.user_id) || 0,
          recentReads: userRecentReads.get(profile.user_id) || 0,
          recentComments: userRecentComments.get(profile.user_id) || 0,
          totalEngagement: totalUpvotes * 2 + totalReads * 0.5 + totalComments * 3,
        };
        return poet;
      });

      // Categorize poets using ranking algorithm
      const categorized = categorizePoets(poetsWithMetrics);

      setTrendingPoets(categorized.trending);
      setRisingPoets(categorized.rising);
      setNewPoets(categorized.newVoices);
      setAllPoets(categorized.all);
    } catch (err) {
      console.error('Error fetching discover poets:', err);
      setError('Failed to load poets');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPoets();
  }, [fetchPoets]);

  return {
    trendingPoets,
    risingPoets,
    newPoets,
    allPoets,
    isLoading,
    error,
    refresh: fetchPoets,
  };
}

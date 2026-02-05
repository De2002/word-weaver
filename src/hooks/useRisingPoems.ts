import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Poem, BadgeType } from '@/types/poem';
import { sortByRising } from '@/lib/ranking';
 import { fetchPoemAudioUrls } from '@/lib/poemAudio';

interface DbPoem {
  id: string;
  title: string | null;
  content: string;
  tags: string[];
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface DbProfile {
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

interface UseRisingPoemsReturn {
  poems: Poem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => Promise<void>;
}

const PAGE_SIZE = 10;
const RISING_WINDOW_DAYS = 7; // Only poems from last 7 days

export function useRisingPoems(): UseRisingPoemsReturn {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allRisingPoems, setAllRisingPoems] = useState<Poem[]>([]);

  const fetchPoems = useCallback(async (pageNum: number, append: boolean = false) => {
    try {
      if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      // Calculate date threshold for rising poems (last 7 days)
      const risingThreshold = new Date();
      risingThreshold.setDate(risingThreshold.getDate() - RISING_WINDOW_DAYS);

      // Fetch poems from the last 7 days
      const { data: poemsData, error: poemsError } = await supabase
        .from('poems')
        .select('*')
        .eq('status', 'published')
        .gte('created_at', risingThreshold.toISOString())
        .order('created_at', { ascending: false });

      if (poemsError) throw poemsError;

      if (!poemsData || poemsData.length === 0) {
        if (pageNum === 1) {
          setPoems([]);
          setAllRisingPoems([]);
        }
        setHasMore(false);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set((poemsData as DbPoem[]).map(p => p.user_id))];

      // Fetch profiles for all authors
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, bio, created_at')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      const profileMap = new Map((profilesData as DbProfile[]).map(p => [p.user_id, p]));

      // Fetch engagement counts for all poems
      const poemIds = (poemsData as DbPoem[]).map(p => p.id);

      const [upvotesRes, commentsRes, savesRes, readsRes, followersRes] = await Promise.all([
        supabase.from('poem_upvotes').select('poem_id').in('poem_id', poemIds),
        supabase.from('comments').select('poem_id').in('poem_id', poemIds),
        supabase.from('poem_saves').select('poem_id').in('poem_id', poemIds),
        supabase.from('poem_reads').select('poem_id').in('poem_id', poemIds),
        supabase.from('follows').select('following_id').in('following_id', userIds),
      ]);

      // Count engagements per poem
      const upvoteCounts = new Map<string, number>();
      const commentCounts = new Map<string, number>();
      const saveCounts = new Map<string, number>();
      const readCounts = new Map<string, number>();
      const followerCounts = new Map<string, number>();

      (upvotesRes.data || []).forEach(u => {
        upvoteCounts.set(u.poem_id, (upvoteCounts.get(u.poem_id) || 0) + 1);
      });
      (commentsRes.data || []).forEach(c => {
        commentCounts.set(c.poem_id, (commentCounts.get(c.poem_id) || 0) + 1);
      });
      (savesRes.data || []).forEach(s => {
        saveCounts.set(s.poem_id, (saveCounts.get(s.poem_id) || 0) + 1);
      });
      (readsRes.data || []).forEach(r => {
        readCounts.set(r.poem_id, (readCounts.get(r.poem_id) || 0) + 1);
      });
      (followersRes.data || []).forEach(f => {
        followerCounts.set(f.following_id, (followerCounts.get(f.following_id) || 0) + 1);
      });

      // Fetch audio URLs for all poems
      const audioMap = await fetchPoemAudioUrls(poemIds);

      // Transform to Poem type
      const transformedPoems: Poem[] = (poemsData as DbPoem[]).map(poem => {
        const profile = profileMap.get(poem.user_id);
        const accountAge = profile ? Date.now() - new Date(profile.created_at).getTime() : Infinity;
        const isNewPoet = accountAge < 14 * 24 * 60 * 60 * 1000;
        
        const badges: { type: BadgeType; label: string }[] = [];
        if (isNewPoet) {
          badges.push({ type: 'new', label: 'New Voice' });
        }

        return {
          id: poem.id,
          title: poem.title || 'Untitled',
          text: poem.content,
          language: 'en',
          poet: {
            id: poem.user_id,
            name: profile?.display_name || profile?.username || 'Anonymous Poet',
            username: profile?.username || 'anonymous',
            avatar: profile?.avatar_url || '',
            bio: profile?.bio || '',
            languages: ['en'],
            totalReads: 0,
            totalUpvotes: 0,
            totalPoems: 0,
            followersCount: followerCounts.get(poem.user_id) || 0,
            badges,
            isFollowing: false,
          },
          tags: poem.tags || [],
          upvotes: upvoteCounts.get(poem.id) || 0,
          comments: commentCounts.get(poem.id) || 0,
          saves: saveCounts.get(poem.id) || 0,
          reads: readCounts.get(poem.id) || 0,
          createdAt: poem.created_at,
          isUpvoted: false,
          isSaved: false,
          audioUrl: audioMap.get(poem.id),
        };
      });

      // Apply rising algorithm (sorts by engagement velocity)
      const risingPoems = sortByRising(transformedPoems);

      if (pageNum === 1) {
        setAllRisingPoems(risingPoems);
        const paginatedPoems = risingPoems.slice(0, PAGE_SIZE);
        setPoems(paginatedPoems);
        setHasMore(risingPoems.length > PAGE_SIZE);
      } else {
        const start = (pageNum - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        const paginatedPoems = allRisingPoems.slice(0, end);
        setPoems(paginatedPoems);
        setHasMore(end < allRisingPoems.length);
      }
    } catch (err) {
      console.error('Error fetching rising poems:', err);
      setError('Failed to load rising poems');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [allRisingPoems]);

  useEffect(() => {
    fetchPoems(1);
  }, []);

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPoems(nextPage, true);
    }
  }, [page, isLoadingMore, hasMore, fetchPoems]);

  const refresh = useCallback(async () => {
    setPage(1);
    await fetchPoems(1);
  }, [fetchPoems]);

  return {
    poems,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}

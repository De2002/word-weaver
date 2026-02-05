import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/db';
import { Poem } from '@/types/poem';
import { sortByHot } from '@/lib/ranking';
 import { fetchPoemAudioUrls } from '@/lib/poemAudio';

interface DbPoem {
  id: string;
  slug: string;
  title: string | null;
  content: string;
  user_id: string;
  status: 'draft' | 'published';
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface DbProfile {
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface UseTrendingPoemsReturn {
  poems: Poem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

const PAGE_SIZE = 20;

export function useTrendingPoems(): UseTrendingPoemsReturn {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const fetchPoems = useCallback(async (pageNum: number, append: boolean = false) => {
    try {
      if (pageNum === 0) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      // Fetch all published poems with their engagement counts
      // We fetch more than needed to sort by trending score
      const { data: poemsData, error: poemsError } = await db
        .from('poems')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(0, 100); // Get a larger batch to sort by trending

      if (poemsError) throw poemsError;

      if (!poemsData || poemsData.length === 0) {
        setPoems([]);
        setHasMore(false);
        return;
      }

      // Fetch engagement counts for each poem
      const poemIds = poemsData.map(p => p.id);
      
      const [upvotesResult, commentsResult, savesResult, readsResult, profilesResult] = await Promise.all([
        db.from('poem_upvotes').select('poem_id').in('poem_id', poemIds),
        db.from('comments').select('poem_id').in('poem_id', poemIds),
        db.from('poem_saves').select('poem_id').in('poem_id', poemIds),
        db.from('poem_reads').select('poem_id').in('poem_id', poemIds),
        db.from('profiles').select('*').in('user_id', poemsData.map(p => p.user_id))
      ]);

      // Count engagement per poem
      const upvoteCounts = new Map<string, number>();
      const commentCounts = new Map<string, number>();
      const saveCounts = new Map<string, number>();
      const readCounts = new Map<string, number>();

      upvotesResult.data?.forEach(u => {
        upvoteCounts.set(u.poem_id, (upvoteCounts.get(u.poem_id) || 0) + 1);
      });
      commentsResult.data?.forEach(c => {
        commentCounts.set(c.poem_id, (commentCounts.get(c.poem_id) || 0) + 1);
      });
      savesResult.data?.forEach(s => {
        saveCounts.set(s.poem_id, (saveCounts.get(s.poem_id) || 0) + 1);
      });
      readsResult.data?.forEach(r => {
        readCounts.set(r.poem_id, (readCounts.get(r.poem_id) || 0) + 1);
      });

      const profileMap = new Map<string, DbProfile>();
      profilesResult.data?.forEach(p => profileMap.set(p.user_id, p));

      // Fetch audio URLs for all poems
      const audioMap = await fetchPoemAudioUrls(poemIds);

      // Map to Poem type with engagement data
      const mappedPoems: Poem[] = (poemsData as DbPoem[]).map(dbPoem => {
        const profile = profileMap.get(dbPoem.user_id);
        return {
          id: dbPoem.id,
          slug: dbPoem.slug,
          title: dbPoem.title || undefined,
          text: dbPoem.content,
          language: 'en',
          createdAt: dbPoem.created_at,
          tags: dbPoem.tags || [],
          upvotes: upvoteCounts.get(dbPoem.id) || 0,
          comments: commentCounts.get(dbPoem.id) || 0,
          saves: saveCounts.get(dbPoem.id) || 0,
          reads: readCounts.get(dbPoem.id) || 0,
          audioUrl: audioMap.get(dbPoem.id),
          poet: {
            id: dbPoem.user_id,
            name: profile?.display_name || profile?.username || 'Anonymous',
            username: profile?.username || 'anonymous',
            avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${dbPoem.user_id}`,
            bio: profile?.bio || '',
            languages: ['en'],
            totalReads: 0,
            totalUpvotes: 0,
            totalPoems: 0,
            followersCount: 0,
            badges: [],
          },
        };
      });

      // Sort by hot/trending score using the ranking algorithm
      const sortedPoems = sortByHot(mappedPoems);

      // Paginate the sorted results
      const startIndex = pageNum * PAGE_SIZE;
      const endIndex = startIndex + PAGE_SIZE;
      const pagePoems = sortedPoems.slice(startIndex, endIndex);

      if (append) {
        setPoems(prev => [...prev, ...pagePoems]);
      } else {
        setPoems(pagePoems);
      }

      setHasMore(endIndex < sortedPoems.length);
    } catch (err) {
      console.error('Error fetching trending poems:', err);
      setError('Failed to load trending poems');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPoems(0);
  }, [fetchPoems]);

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPoems(nextPage, true);
    }
  }, [isLoadingMore, hasMore, page, fetchPoems]);

  const refresh = useCallback(() => {
    setPage(0);
    setHasMore(true);
    fetchPoems(0, false);
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

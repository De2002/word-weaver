import { useEffect, useState, useCallback } from 'react';
import { db } from '@/lib/db';
import type { Poem } from '@/types/poem';
import { useAuth } from '@/context/AuthProvider';

const PAGE_SIZE = 10;

export function useTagFollowingPoems(tag: string) {
  const { user } = useAuth();
  const [poems, setPoems] = useState<Poem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [isAuthenticated] = useState(!!user);

  const fetchPoems = useCallback(async (pageNum: number) => {
    if (!user || !tag) {
      setPoems([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const { data: followingData, error: followingError } = await db
        .from('follows')
        .select('following_id')
        .eq('user_id', user.id);

      if (followingError) throw followingError;

      const followingIds = followingData?.map((f) => f.following_id) || [];

      if (followingIds.length === 0) {
        setPoems([]);
        setHasMore(false);
        return;
      }

      const { data, error: poemError } = await db
        .from('poems')
        .select('*')
        .contains('tags', [tag])
        .in('user_id', followingIds)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

      if (poemError) throw poemError;

      if (pageNum === 0) {
        setPoems(data || []);
      } else {
        setPoems((prev) => [...prev, ...(data || [])]);
      }

      setHasMore((data?.length || 0) === PAGE_SIZE);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load poems');
    } finally {
      setIsLoading(false);
    }
  }, [user, tag]);

  useEffect(() => {
    setPoems([]);
    setPage(0);
    setHasMore(true);
    setError(null);
    fetchPoems(0);
  }, [tag, fetchPoems]);

  const refresh = useCallback(() => {
    setPoems([]);
    setPage(0);
    setHasMore(true);
    setError(null);
    fetchPoems(0);
  }, [fetchPoems]);

  return {
    poems,
    isLoading,
    error,
    hasMore,
    refresh,
    loadMore: () => {
      if (isLoading || !hasMore) return;

      setPage((p) => {
        const nextPage = p + 1;
        fetchPoems(nextPage);
        return nextPage;
      });
    },
    isAuthenticated,
  };
}

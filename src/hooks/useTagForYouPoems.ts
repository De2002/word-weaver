import { useEffect, useState, useCallback } from 'react';
import { db } from '@/lib/db';
import type { Poem } from '@/types/poem';
import { useAuth } from '@/context/AuthProvider';

const PAGE_SIZE = 10;

export function useTagForYouPoems(tag: string) {
  const { user } = useAuth();
  const [poems, setPoems] = useState<Poem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const fetchPoems = useCallback(async (pageNum: number) => {
    if (!tag) {
      setPoems([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      let query = db
        .from('poems')
        .select('*')
        .contains('tags', [tag])
        .eq('status', 'published')
        .order('likes_count', { ascending: false })
        .order('created_at', { ascending: false });

      if (user) {
        // Get poems from followed poets if user is authenticated
        const { data: followingData, error: followingError } = await db
          .from('follows')
          .select('following_id')
          .eq('user_id', user.id);

        if (followingError) throw followingError;

        const followingIds = followingData?.map((f) => f.following_id) || [];
        
        if (followingIds.length > 0) {
          query = query.in('user_id', followingIds);
        }
      }

      const { data, error: poemError } = await query.range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

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

  return {
    poems,
    isLoading,
    error,
    hasMore,
    loadMore: () => {
      setPage((p) => {
        const nextPage = p + 1;
        fetchPoems(nextPage);
        return nextPage;
      });
    },
  };
}

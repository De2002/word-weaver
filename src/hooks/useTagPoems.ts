import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Poem, Poet } from '@/types/poem';
import { fetchPoemAudioUrls } from '@/lib/poemAudio';
import { normalizeTag } from '@/lib/tags';

const PAGE_SIZE = 20;

interface UseTagPoemsReturn {
  poems: Poem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
  totalCount: number;
}

export function useTagPoems(tag: string): UseTagPoemsReturn {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const normalized = normalizeTag(tag);

  const fetchPoems = useCallback(async (pageNum: number, append: boolean = false) => {
    if (!normalized) return;

    try {
      if (pageNum === 0) setIsLoading(true);
      else setIsLoadingMore(true);

      const from = pageNum * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // Fetch poems that contain this tag using Postgres array contains
      const { data: poemsData, error, count } = await supabase
        .from('poems')
        .select('id, slug, title, content, tags, status, created_at, updated_at, user_id', { count: 'exact' })
        .eq('status', 'published')
        .contains('tags', [normalized])
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (pageNum === 0 && count !== null) {
        setTotalCount(count);
      }

      if (!poemsData || poemsData.length === 0) {
        if (append) setHasMore(false);
        else { setPoems([]); setTotalCount(0); }
        return;
      }

      // Fetch profiles
      const userIds = [...new Set(poemsData.map(p => p.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, bio, links')
        .in('user_id', userIds);

      const profilesMap = new Map<string, any>();
      (profilesData || []).forEach(p => profilesMap.set(p.user_id, p));

      // Fetch audio
      const poemIds = poemsData.map(p => p.id);
      const audioMap = await fetchPoemAudioUrls(poemIds);

      // Fetch engagement counts
      const [upvotesRes, commentsRes, savesRes, readsRes] = await Promise.all([
        supabase.from('poem_upvotes').select('poem_id').in('poem_id', poemIds),
        supabase.from('comments').select('poem_id').in('poem_id', poemIds),
        supabase.from('poem_saves').select('poem_id').in('poem_id', poemIds),
        supabase.from('poem_reads').select('poem_id').in('poem_id', poemIds),
      ]);

      const countMap = (data: any[] | null, key: string) => {
        const map = new Map<string, number>();
        (data || []).forEach(row => {
          map.set(row[key], (map.get(row[key]) || 0) + 1);
        });
        return map;
      };

      const upvoteCounts = countMap(upvotesRes.data, 'poem_id');
      const commentCounts = countMap(commentsRes.data, 'poem_id');
      const saveCounts = countMap(savesRes.data, 'poem_id');
      const readCounts = countMap(readsRes.data, 'poem_id');

      const mappedPoems: Poem[] = poemsData.map(dbPoem => {
        const profile = profilesMap.get(dbPoem.user_id);
        const poet: Poet = {
          id: dbPoem.user_id,
          name: profile?.display_name || profile?.username || 'Anonymous',
          username: profile?.username || 'anonymous',
          avatar: profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
          bio: profile?.bio || '',
          languages: ['English'],
          totalReads: 0,
          totalUpvotes: 0,
          totalPoems: 0,
          followersCount: 0,
          badges: [],
          supportLinks: profile?.links as Poet['supportLinks'],
        };

        return {
          id: dbPoem.id,
          slug: dbPoem.slug,
          title: dbPoem.title || undefined,
          text: dbPoem.content,
          poet,
          language: 'English',
          tags: dbPoem.tags || [],
          upvotes: upvoteCounts.get(dbPoem.id) || 0,
          comments: commentCounts.get(dbPoem.id) || 0,
          saves: saveCounts.get(dbPoem.id) || 0,
          reads: readCounts.get(dbPoem.id) || 0,
          createdAt: dbPoem.created_at,
          audioUrl: audioMap.get(dbPoem.id),
        };
      });

      if (append) {
        setPoems(prev => [...prev, ...mappedPoems]);
      } else {
        setPoems(mappedPoems);
      }
      setHasMore(mappedPoems.length === PAGE_SIZE);
    } catch (err) {
      console.error('Error fetching tag poems:', err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [normalized]);

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchPoems(0);
  }, [fetchPoems]);

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      const next = page + 1;
      setPage(next);
      fetchPoems(next, true);
    }
  }, [isLoadingMore, hasMore, page, fetchPoems]);

  const refresh = useCallback(() => {
    setPage(0);
    setHasMore(true);
    fetchPoems(0);
  }, [fetchPoems]);

  return { poems, isLoading, isLoadingMore, hasMore, loadMore, refresh, totalCount };
}

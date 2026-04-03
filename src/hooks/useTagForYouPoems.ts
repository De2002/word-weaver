import { useEffect, useState, useCallback, useRef } from 'react';
import { db } from '@/lib/db';
import type { Poem, Poet } from '@/types/poem';
import { fetchPoemAudioUrls } from '@/lib/poemAudio';
import { normalizeTag } from '@/lib/tags';

const PAGE_SIZE = 10;
const CANDIDATE_POOL_SIZE = 150;

export function useTagForYouPoems(tag: string) {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const rankedPoemsRef = useRef<Poem[]>([]);
  const normalizedTag = normalizeTag(tag);

  const rankPoems = (poemsToRank: Poem[]) => {
    const now = Date.now();
    return [...poemsToRank].sort((a, b) => {
      const getScore = (poem: Poem) => {
        const ageHours = Math.max((now - new Date(poem.createdAt).getTime()) / 3600000, 1);
        const engagement = poem.upvotes + poem.comments * 2.5 + poem.saves * 3;
        const velocity = engagement / (ageHours + 3);
        const recentBoost = ageHours <= 72 ? 1.25 : 1;
        return velocity * recentBoost;
      };

      return getScore(b) - getScore(a);
    });
  };

  const fetchAndRankPoems = useCallback(async (): Promise<Poem[]> => {
    const { data: poemsData, error: poemsError } = await db
      .from('poems')
      .select('id, slug, title, content, tags, status, created_at, user_id')
      .contains('tags', [normalizedTag])
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(CANDIDATE_POOL_SIZE);

    if (poemsError) throw poemsError;
    if (!poemsData || poemsData.length === 0) return [];

    const userIds = [...new Set(poemsData.map((poem) => poem.user_id))];
    const { data: profilesData } = await db
      .from('profiles')
      .select('user_id, username, display_name, avatar_url, bio, links')
      .in('user_id', userIds);

    const profilesMap = new Map<string, any>();
    (profilesData || []).forEach((profile) => profilesMap.set(profile.user_id, profile));

    const poemIds = poemsData.map((poem) => poem.id);
    const [audioMap, upvotesRes, commentsRes, savesRes, readsRes] = await Promise.all([
      fetchPoemAudioUrls(poemIds),
      db.from('poem_upvotes').select('poem_id').in('poem_id', poemIds),
      db.from('comments').select('poem_id').in('poem_id', poemIds),
      db.from('poem_saves').select('poem_id').in('poem_id', poemIds),
      db.from('poem_reads').select('poem_id').in('poem_id', poemIds),
    ]);

    const countMap = (data: any[] | null, key: string) => {
      const map = new Map<string, number>();
      (data || []).forEach((row) => {
        map.set(row[key], (map.get(row[key]) || 0) + 1);
      });
      return map;
    };

    const upvoteCounts = countMap(upvotesRes.data, 'poem_id');
    const commentCounts = countMap(commentsRes.data, 'poem_id');
    const saveCounts = countMap(savesRes.data, 'poem_id');
    const readCounts = countMap(readsRes.data, 'poem_id');

    const mappedPoems: Poem[] = poemsData.map((dbPoem) => {
      const profile = profilesMap.get(dbPoem.user_id);
      const poet: Poet = {
        id: dbPoem.user_id,
        name: profile?.display_name || profile?.username || 'Anonymous',
        username: profile?.username || 'anonymous',
        avatar: profile?.avatar_url || '',
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

    return rankPoems(mappedPoems);
  }, [normalizedTag]);

  const fetchPoems = useCallback(async (pageNum: number) => {
    if (!normalizedTag) {
      setPoems([]);
      setHasMore(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (pageNum === 0 || rankedPoemsRef.current.length === 0) {
        rankedPoemsRef.current = await fetchAndRankPoems();
      }

      const pageStart = pageNum * PAGE_SIZE;
      const pageEnd = (pageNum + 1) * PAGE_SIZE;
      const pagePoems = rankedPoemsRef.current.slice(pageStart, pageEnd);

      if (pageNum === 0) {
        setPoems(pagePoems);
      } else {
        setPoems((prev) => [...prev, ...pagePoems]);
      }

      setHasMore(pageEnd < rankedPoemsRef.current.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load poems');
    } finally {
      setIsLoading(false);
    }
  }, [normalizedTag, fetchAndRankPoems]);

  useEffect(() => {
    setPoems([]);
    setPage(0);
    setHasMore(true);
    setError(null);
    rankedPoemsRef.current = [];
    fetchPoems(0);
  }, [normalizedTag, fetchPoems]);

  const refresh = useCallback(() => {
    setPoems([]);
    setPage(0);
    setHasMore(true);
    setError(null);
    rankedPoemsRef.current = [];
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
  };
}

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/db';
import { Poem, Poet } from '@/types/poem';
import { fetchPoemAudioUrls } from '@/lib/poemAudio';

const PAGE_SIZE = 10;

interface UseTopLikedPoemsReturn {
  poems: Poem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

interface DbPoem {
  id: string;
  slug: string;
  title: string | null;
  content: string;
  tags: string[];
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface DbProfile {
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  links: Record<string, string>;
}

function mapDbPoemToPoem(
  dbPoem: DbPoem,
  profile: DbProfile | null,
  upvotes: number,
  audioUrl?: string,
): Poem {
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
    upvotes,
    comments: 0,
    saves: 0,
    reads: 0,
    createdAt: dbPoem.created_at,
    isUpvoted: false,
    isSaved: false,
    audioUrl,
  };
}

export function useTopLikedPoems(): UseTopLikedPoemsReturn {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchPoems = useCallback(async (pageNum: number, append = false) => {
    try {
      if (pageNum === 0) setIsLoading(true);
      else setIsLoadingMore(true);
      setError(null);

      const { data: poemsData, error: poemsError } = await db
        .from('poems')
        .select('id, slug, title, content, tags, status, created_at, updated_at, user_id')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(250);

      if (poemsError) throw poemsError;

      if (!poemsData || poemsData.length === 0) {
        if (!append) setPoems([]);
        setHasMore(false);
        return;
      }

      const poemIds = poemsData.map((poem: DbPoem) => poem.id);
      const userIds = [...new Set(poemsData.map((poem: DbPoem) => poem.user_id))];

      const [upvotesResult, profilesResult, audioMap] = await Promise.all([
        db.from('poem_upvotes').select('poem_id').in('poem_id', poemIds),
        db.from('profiles').select('user_id, username, display_name, avatar_url, bio, links').in('user_id', userIds),
        fetchPoemAudioUrls(poemIds),
      ]);

      const upvoteCounts = new Map<string, number>();
      (upvotesResult.data || []).forEach((upvote) => {
        upvoteCounts.set(upvote.poem_id, (upvoteCounts.get(upvote.poem_id) || 0) + 1);
      });

      const profilesMap = new Map<string, DbProfile>();
      (profilesResult.data || []).forEach((profile: DbProfile) => {
        profilesMap.set(profile.user_id, profile);
      });

      const rankedPoems = (poemsData as DbPoem[])
        .map((poem) => ({ poem, upvotes: upvoteCounts.get(poem.id) || 0 }))
        .sort((a, b) => {
          if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
          return new Date(b.poem.created_at).getTime() - new Date(a.poem.created_at).getTime();
        });

      const startIndex = pageNum * PAGE_SIZE;
      const endIndex = startIndex + PAGE_SIZE;
      const pagePoems = rankedPoems.slice(startIndex, endIndex).map(({ poem, upvotes }) =>
        mapDbPoemToPoem(poem, profilesMap.get(poem.user_id) || null, upvotes, audioMap.get(poem.id)),
      );

      if (append) setPoems((prev) => [...prev, ...pagePoems]);
      else setPoems(pagePoems);

      setHasMore(endIndex < rankedPoems.length);
    } catch (err) {
      console.error('Error fetching top liked poems:', err);
      setError(err instanceof Error ? err.message : 'Failed to load top liked poems');
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
  }, [fetchPoems, hasMore, isLoadingMore, page]);

  const refresh = useCallback(() => {
    setPage(0);
    setHasMore(true);
    fetchPoems(0);
  }, [fetchPoems]);

  return { poems, isLoading, isLoadingMore, error, hasMore, loadMore, refresh };
}

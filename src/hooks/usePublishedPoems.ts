import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/db';
import { Poem, Poet } from '@/types/poem';
 import { fetchPoemAudioUrls } from '@/lib/poemAudio';

const PAGE_SIZE = 10;

interface UsePublishedPoemsReturn {
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

function mapDbPoemToPoem(dbPoem: DbPoem, profile: DbProfile | null, audioUrl?: string): Poem {
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
    title: dbPoem.title || undefined,
    text: dbPoem.content,
    poet,
    language: 'English',
    tags: dbPoem.tags || [],
    upvotes: 0,
    comments: 0,
    saves: 0,
    reads: 0,
    createdAt: dbPoem.created_at,
    isUpvoted: false,
    isSaved: false,
    audioUrl,
  };
}

export function usePublishedPoems(): UsePublishedPoemsReturn {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchPoems = useCallback(async (pageNum: number, append: boolean = false) => {
    try {
      if (pageNum === 0) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      const from = pageNum * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // Fetch poems
      const { data: poemsData, error: fetchError } = await db
        .from('poems')
        .select('id, title, content, tags, status, created_at, updated_at, user_id')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (fetchError) {
        throw fetchError;
      }

      if (!poemsData || poemsData.length === 0) {
        if (append) {
          setHasMore(false);
        } else {
          setPoems([]);
        }
        return;
      }

      // Get unique user IDs and fetch their profiles
      const userIds = [...new Set(poemsData.map((p: DbPoem) => p.user_id))];
      const { data: profilesData } = await db
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, bio, links')
        .in('user_id', userIds);

      // Create a map of user_id to profile
      const profilesMap = new Map<string, DbProfile>();
      (profilesData || []).forEach((p: DbProfile) => {
        profilesMap.set(p.user_id, p);
      });

      // Fetch audio URLs for all poems
      const poemIds = poemsData.map((p: DbPoem) => p.id);
      const audioMap = await fetchPoemAudioUrls(poemIds);

      // Map poems with their profiles
      const mappedPoems = poemsData.map((poem: DbPoem) => 
        mapDbPoemToPoem(poem, profilesMap.get(poem.user_id) || null, audioMap.get(poem.id))
      );
      
      if (append) {
        setPoems(prev => [...prev, ...mappedPoems]);
      } else {
        setPoems(mappedPoems);
      }

      setHasMore(mappedPoems.length === PAGE_SIZE);
    } catch (err) {
      console.error('Error fetching poems:', err);
      setError(err instanceof Error ? err.message : 'Failed to load poems');
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
    fetchPoems(0);
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

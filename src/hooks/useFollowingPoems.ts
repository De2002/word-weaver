import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { useAuth } from '@/context/AuthProvider';
import { Poem, Poet } from '@/types/poem';
 import { fetchPoemAudioUrls } from '@/lib/poemAudio';

const PAGE_SIZE = 10;

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

export function useFollowingPoems() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [page, setPage] = useState(0);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['following-poems', userId, page],
    queryFn: async () => {
      if (!userId) return { poems: [], hasMore: false };

      // First get the list of poets we follow
      const { data: follows, error: followsError } = await db
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);

      if (followsError) throw followsError;
      
      if (!follows || follows.length === 0) {
        return { poems: [], hasMore: false };
      }

      const followingIds = follows.map((f: { following_id: string }) => f.following_id);

      // Fetch poems from followed poets
      const from = 0;
      const to = (page + 1) * PAGE_SIZE - 1;

      const { data: poemsData, error: poemsError } = await db
        .from('poems')
        .select('id, title, content, tags, status, created_at, updated_at, user_id')
        .in('user_id', followingIds)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (poemsError) throw poemsError;

      if (!poemsData || poemsData.length === 0) {
        return { poems: [], hasMore: false };
      }

      // Get profiles for poets
      const userIds = [...new Set(poemsData.map((p: DbPoem) => p.user_id))];
      const { data: profilesData } = await db
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, bio, links')
        .in('user_id', userIds);

      const profilesMap = new Map<string, DbProfile>();
      (profilesData || []).forEach((p: DbProfile) => {
        profilesMap.set(p.user_id, p);
      });

      // Fetch audio URLs for all poems
      const poemIds = poemsData.map((p: DbPoem) => p.id);
      const audioMap = await fetchPoemAudioUrls(poemIds);

      const mappedPoems = poemsData.map((poem: DbPoem) =>
        mapDbPoemToPoem(poem, profilesMap.get(poem.user_id) || null, audioMap.get(poem.id))
      );

      return {
        poems: mappedPoems,
        hasMore: mappedPoems.length === (page + 1) * PAGE_SIZE,
      };
    },
    enabled: !!userId,
  });

  const loadMore = useCallback(() => {
    setPage((p) => p + 1);
  }, []);

  const refresh = useCallback(() => {
    setPage(0);
    refetch();
  }, [refetch]);

  return {
    poems: data?.poems || [],
    isLoading,
    hasMore: data?.hasMore || false,
    error: error ? (error as Error).message : null,
    loadMore,
    refresh,
    isAuthenticated: !!userId,
  };
}

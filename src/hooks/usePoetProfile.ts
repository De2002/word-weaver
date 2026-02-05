import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { Poem, Poet, Badge } from '@/types/poem';
 import { fetchPoemAudioUrls } from '@/lib/poemAudio';

interface UsePoetProfileResult {
  poet: Poet | null;
  poems: Poem[];
  isLoading: boolean;
  error: Error | null;
  notFound: boolean;
  followerCount: number;
}

export function usePoetProfile(username: string): UsePoetProfileResult {
  // Fetch poet profile by username
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ['poet-profile', username],
    queryFn: async () => {
      const { data, error } = await db
        .from('profiles')
        .select('*')
        .eq('username', username)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!username,
  });

  // Fetch published poems for this poet
  const {
    data: poemsData,
    isLoading: poemsLoading,
    error: poemsError,
  } = useQuery({
    queryKey: ['poet-poems', profile?.user_id],
    queryFn: async () => {
      const { data, error } = await db
        .from('poems')
        .select('*')
        .eq('user_id', profile.user_id)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.user_id,
  });

  // Fetch follower count
  const { data: followerCount } = useQuery({
    queryKey: ['follower-count', profile?.user_id],
    queryFn: async () => {
      const { count, error } = await db
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profile.user_id);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!profile?.user_id,
  });

  // Fetch total reads for this poet's poems
  const { data: totalReads } = useQuery({
    queryKey: ['poet-total-reads', profile?.user_id],
    queryFn: async () => {
      if (!poemsData || poemsData.length === 0) return 0;
      const poemIds = poemsData.map((p: any) => p.id);
      const { count, error } = await db
        .from('poem_reads')
        .select('*', { count: 'exact', head: true })
        .in('poem_id', poemIds);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!poemsData && poemsData.length > 0,
  });

  // Fetch total upvotes for this poet's poems
  const { data: totalUpvotes } = useQuery({
    queryKey: ['poet-total-upvotes', profile?.user_id],
    queryFn: async () => {
      if (!poemsData || poemsData.length === 0) return 0;
      const poemIds = poemsData.map((p: any) => p.id);
      const { count, error } = await db
        .from('poem_upvotes')
        .select('*', { count: 'exact', head: true })
        .in('poem_id', poemIds);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!poemsData && poemsData.length > 0,
  });

  // Fetch audio URLs for this poet's poems
  const { data: audioMap } = useQuery({
    queryKey: ['poet-poems-audio', profile?.user_id],
    queryFn: async () => {
      if (!poemsData || poemsData.length === 0) return new Map<string, string>();
      const poemIds = poemsData.map((p: any) => p.id);
      return fetchPoemAudioUrls(poemIds);
    },
    enabled: !!poemsData && poemsData.length > 0,
  });

  // Transform to app types
  const poet: Poet | null = profile
    ? {
        id: profile.user_id,
        name: profile.display_name || profile.username || 'Anonymous',
        username: profile.username || 'unknown',
        avatar: profile.avatar_url || '',
        bio: profile.bio || '',
        languages: [],
        totalReads: totalReads || 0,
        totalUpvotes: totalUpvotes || 0,
        totalPoems: poemsData?.length || 0,
        followersCount: followerCount || 0,
        supportLinks: profile.links || {},
        badges: [] as Badge[],
        isFollowing: false,
      }
    : null;

  const poems: Poem[] = (poemsData || []).map((p: any) => ({
    id: p.id,
    title: p.title || undefined,
    text: p.content,
    poet: poet!,
    imageUrl: undefined,
    audioUrl: audioMap?.get(p.id),
    language: 'en',
    tags: p.tags || [],
    upvotes: 0,
    comments: 0,
    saves: 0,
    reads: 0,
    createdAt: p.created_at,
    isUpvoted: false,
    isSaved: false,
  }));

  return {
    poet,
    poems,
    isLoading: profileLoading || poemsLoading,
    error: (profileError || poemsError) as Error | null,
    notFound: !profileLoading && !profile,
    followerCount: followerCount || 0,
  };
}

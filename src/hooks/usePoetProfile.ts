import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { Poem, Poet, Badge } from '@/types/poem';

interface UsePoetProfileResult {
  poet: Poet | null;
  poems: Poem[];
  isLoading: boolean;
  error: Error | null;
  notFound: boolean;
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

  // Transform to app types
  const poet: Poet | null = profile
    ? {
        id: profile.user_id,
        name: profile.display_name || profile.username || 'Anonymous',
        username: profile.username || 'unknown',
        avatar: profile.avatar_url || '',
        bio: profile.bio || '',
        languages: [],
        totalReads: 0, // Will be computed when interaction tables exist
        totalUpvotes: 0,
        totalPoems: poemsData?.length || 0,
        followersCount: 0,
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
    audioUrl: undefined,
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
  };
}

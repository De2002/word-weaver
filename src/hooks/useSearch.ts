import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  type: 'poet' | 'poem' | 'tag';
  id: string;
  title: string;
  subtitle?: string;
  avatarUrl?: string;
  href: string;
}

interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  isLoading: boolean;
  groupedResults: {
    poets: SearchResult[];
    poems: SearchResult[];
    tags: SearchResult[];
  };
}

export function useSearch(): UseSearchReturn {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchPoets = useCallback(async (searchQuery: string): Promise<SearchResult[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, username, display_name, avatar_url, bio')
      .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`)
      .limit(5);

    if (error || !data) return [];

    return data.map((profile) => ({
      type: 'poet' as const,
      id: profile.user_id,
      title: profile.display_name || profile.username || 'Poet',
      subtitle: profile.username ? `@${profile.username}` : undefined,
      avatarUrl: profile.avatar_url || undefined,
      href: `/poet/${profile.username}`,
    }));
  }, []);

  const searchPoems = useCallback(async (searchQuery: string): Promise<SearchResult[]> => {
    // First, search poems
    const { data: poemsData, error: poemsError } = await supabase
      .from('poems')
      .select('id, title, content, user_id')
      .eq('status', 'published')
      .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
      .limit(5);

    if (poemsError || !poemsData || poemsData.length === 0) return [];

    // Get unique user IDs and fetch profiles
    const userIds = [...new Set(poemsData.map(p => p.user_id))];
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('user_id, username, display_name')
      .in('user_id', userIds);

    const profilesMap = new Map<string, { username: string | null; display_name: string | null }>();
    (profilesData || []).forEach((p) => {
      profilesMap.set(p.user_id, { username: p.username, display_name: p.display_name });
    });

    return poemsData.map((poem) => {
      const profile = profilesMap.get(poem.user_id);
      return {
        type: 'poem' as const,
        id: poem.id,
        title: poem.title || 'Untitled',
        subtitle: `by ${profile?.display_name || profile?.username || 'Anonymous'}`,
        href: `/poem/${poem.id}`,
      };
    });
  }, []);

  const searchTags = useCallback(async (searchQuery: string): Promise<SearchResult[]> => {
    // Get unique tags that match the query from published poems
    const { data, error } = await supabase
      .from('poems')
      .select('tags')
      .eq('status', 'published')
      .not('tags', 'eq', '{}');

    if (error || !data) return [];

    // Extract all unique tags
    const allTags = new Set<string>();
    data.forEach((poem) => {
      if (poem.tags && Array.isArray(poem.tags)) {
        poem.tags.forEach((tag: string) => {
          if (tag.toLowerCase().includes(searchQuery.toLowerCase())) {
            allTags.add(tag);
          }
        });
      }
    });

    // Return top 5 matching tags
    return Array.from(allTags).slice(0, 5).map((tag) => ({
      type: 'tag' as const,
      id: tag,
      title: `#${tag}`,
      subtitle: 'Tag',
      href: `/tag/${encodeURIComponent(tag)}`,
    }));
  }, []);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const [poets, poems, tags] = await Promise.all([
        searchPoets(searchQuery),
        searchPoems(searchQuery),
        searchTags(searchQuery),
      ]);

      setResults([...poets, ...poems, ...tags]);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchPoets, searchPoems, searchTags]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const groupedResults = {
    poets: results.filter((r) => r.type === 'poet'),
    poems: results.filter((r) => r.type === 'poem'),
    tags: results.filter((r) => r.type === 'tag'),
  };

  return {
    query,
    setQuery,
    results,
    isLoading,
    groupedResults,
  };
}

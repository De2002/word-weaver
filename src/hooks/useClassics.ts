import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/db';
import type { ClassicPoet, ClassicPoem } from '@/types/classic';

export function useClassicPoets() {
  return useQuery({
    queryKey: ['classic-poets'],
    queryFn: async () => {
      const { data, error } = await db
        .from('classic_poets')
        .select('*, classic_poems(count)')
        .order('name', { ascending: true });
      if (error) throw error;
      return (data ?? []).map((p: any) => ({
        ...p,
        poem_count: p.classic_poems?.[0]?.count ?? 0,
      })) as ClassicPoet[];
    },
  });
}

export function useClassicPoet(slug: string) {
  return useQuery({
    queryKey: ['classic-poet', slug],
    queryFn: async () => {
      const { data, error } = await db
        .from('classic_poets')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (error) throw error;
      return data as ClassicPoet | null;
    },
    enabled: !!slug,
  });
}

export function useClassicPoetPoems(poetId: string) {
  return useQuery({
    queryKey: ['classic-poet-poems', poetId],
    queryFn: async () => {
      const { data, error } = await db
        .from('classic_poems')
        .select('*')
        .eq('poet_id', poetId)
        .eq('status', 'published')
        .order('title', { ascending: true });
      if (error) throw error;
      return (data ?? []) as ClassicPoem[];
    },
    enabled: !!poetId,
  });
}

export function useClassicPoem(slug: string) {
  return useQuery({
    queryKey: ['classic-poem', slug],
    queryFn: async () => {
      const { data, error } = await db
        .from('classic_poems')
        .select('*, classic_poets(*)')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return { ...data, poet: data.classic_poets } as ClassicPoem;
    },
    enabled: !!slug,
  });
}

export function useRandomClassicPoem() {
  return useQuery({
    queryKey: ['random-classic-poem'],
    queryFn: async () => {
      const { data: count } = await db
        .from('classic_poems')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published');
      const total = (count as any)?.length ?? 0;
      if (total === 0) return null;

      const { data, error } = await db
        .from('classic_poems')
        .select('slug')
        .eq('status', 'published')
        .limit(100);
      if (error || !data?.length) return null;
      const random = data[Math.floor(Math.random() * data.length)];
      return random?.slug as string;
    },
    enabled: false,
  });
}

export function useRecentClassicPoems(limit = 8) {
  return useQuery({
    queryKey: ['recent-classic-poems', limit],
    queryFn: async () => {
      const { data, error } = await db
        .from('classic_poems')
        .select('*, classic_poets(name, slug, image_url, nationality)')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []).map((p: any) => ({
        ...p,
        poet: p.classic_poets,
      })) as ClassicPoem[];
    },
  });
}

export function useFeaturedClassicPoets(limit = 6) {
  return useQuery({
    queryKey: ['featured-classic-poets', limit],
    queryFn: async () => {
      const { data, error } = await db
        .from('classic_poets')
        .select('*, classic_poems(count)')
        .eq('featured', true)
        .limit(limit);
      if (error) throw error;
      return (data ?? []).map((p: any) => ({
        ...p,
        poem_count: p.classic_poems?.[0]?.count ?? 0,
      })) as ClassicPoet[];
    },
  });
}

export function useSearchClassics(query: string) {
  return useQuery({
    queryKey: ['search-classics', query],
    queryFn: async () => {
      if (!query.trim()) return { poems: [], poets: [] };
      const q = query.toLowerCase();
      const [poemsRes, poetsRes] = await Promise.all([
        db
          .from('classic_poems')
          .select('id, title, slug, excerpt, tags, poet_id, classic_poets(name, slug)')
          .eq('status', 'published')
          .or(`title.ilike.%${q}%,tags.cs.{${q}}`)
          .limit(10),
        db
          .from('classic_poets')
          .select('id, name, slug, nationality, image_url')
          .ilike('name', `%${q}%`)
          .limit(5),
      ]);
      return {
        poems: (poemsRes.data ?? []).map((p: any) => ({ ...p, poet: p.classic_poets })),
        poets: poetsRes.data ?? [],
      };
    },
    enabled: query.trim().length >= 2,
  });
}

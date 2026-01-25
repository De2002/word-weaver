import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { useAuth } from '@/context/AuthProvider';
import { Chapbook, ChapbookFilters } from '@/types/chapbook';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 24;

export function useChapbooks(filters: ChapbookFilters = {}, page: number = 1) {
  return useQuery({
    queryKey: ['chapbooks', filters, page],
    queryFn: async () => {
      let query = db
        .from('chapbooks')
        .select('*', { count: 'exact' })
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      // Search filter
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,poet_name.ilike.%${filters.search}%`);
      }

      // Genre filter
      if (filters.genre) {
        query = query.contains('genre_tags', [filters.genre]);
      }

      // Price range filter
      if (filters.priceRange) {
        switch (filters.priceRange) {
          case 'free':
            query = query.eq('is_free', true);
            break;
          case 'under5':
            query = query.eq('is_free', false).lt('price', 5);
            break;
          case '5to10':
            query = query.eq('is_free', false).gte('price', 5).lte('price', 10);
            break;
          case '10to20':
            query = query.eq('is_free', false).gte('price', 10).lte('price', 20);
            break;
          case 'over20':
            query = query.eq('is_free', false).gt('price', 20);
            break;
        }
      }

      // Format filter
      if (filters.format) {
        query = query.eq('format', filters.format);
      }

      // Country filter
      if (filters.country) {
        query = query.ilike('country', `%${filters.country}%`);
      }

      // Year filter
      if (filters.year) {
        query = query.eq('year', filters.year);
      }

      // Pagination
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        chapbooks: data as Chapbook[],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE),
        currentPage: page,
      };
    },
  });
}

export function useChapbook(id: string) {
  return useQuery({
    queryKey: ['chapbook', id],
    queryFn: async () => {
      const { data, error } = await db
        .from('chapbooks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Chapbook;
    },
    enabled: !!id,
  });
}

export function useSubmitChapbook() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (chapbook: Omit<Chapbook, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await db
        .from('chapbooks')
        .insert({
          ...chapbook,
          user_id: user.id,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapbooks'] });
      toast.success('Chapbook submitted for review!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useChapbookSave(chapbookId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: isSaved } = useQuery({
    queryKey: ['chapbook-save', chapbookId, user?.id],
    queryFn: async () => {
      if (!user) return false;

      const { data } = await db
        .from('chapbook_saves')
        .select('id')
        .eq('chapbook_id', chapbookId)
        .eq('user_id', user.id)
        .maybeSingle();

      return !!data;
    },
    enabled: !!user,
  });

  const toggleSave = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in');

      if (isSaved) {
        const { error } = await db
          .from('chapbook_saves')
          .delete()
          .eq('chapbook_id', chapbookId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await db
          .from('chapbook_saves')
          .insert({
            chapbook_id: chapbookId,
            user_id: user.id,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapbook-save', chapbookId] });
      toast.success(isSaved ? 'Removed from saved' : 'Saved to collection');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return { isSaved: isSaved || false, toggleSave };
}

export function useSavedChapbooks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['saved-chapbooks', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await db
        .from('chapbook_saves')
        .select(`
          id,
          created_at,
          chapbook:chapbooks(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map((save: { chapbook: Chapbook }) => save.chapbook);
    },
    enabled: !!user,
  });
}

import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Event } from '@/types/event';
import { useAuth } from '@/context/AuthProvider';

interface UseEventsOptions {
  eventType?: string;
  city?: string;
  dateFilter?: 'today' | 'this_week' | 'this_month' | 'all';
  isOnline?: boolean;
  featured?: boolean;
}

export function useEvents(options: UseEventsOptions = {}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = db
        .from('events')
        .select('*')
        .eq('status', 'approved')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (options.eventType && options.eventType !== 'all') {
        query = query.eq('event_type', options.eventType);
      }

      if (options.city) {
        query = query.ilike('city', `%${options.city}%`);
      }

      if (options.isOnline !== undefined) {
        query = query.eq('is_online', options.isOnline);
      }

      if (options.featured) {
        query = query.eq('is_featured', true);
      }

      if (options.dateFilter && options.dateFilter !== 'all') {
        const now = new Date();
        let endDate: Date;

        switch (options.dateFilter) {
          case 'today':
            endDate = now;
            break;
          case 'this_week':
            endDate = new Date(now);
            endDate.setDate(now.getDate() + 7);
            break;
          case 'this_month':
            endDate = new Date(now);
            endDate.setMonth(now.getMonth() + 1);
            break;
          default:
            endDate = new Date(now);
            endDate.setFullYear(now.getFullYear() + 1);
        }

        query = query.lte('date', endDate.toISOString().split('T')[0]);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;
      setEvents(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [options.eventType, options.city, options.dateFilter, options.isOnline, options.featured]);

  return { events, loading, error, refetch: fetchEvents };
}

export function useFeaturedEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await db
        .from('events')
        .select('*')
        .eq('status', 'approved')
        .eq('is_featured', true)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(5);

      setEvents(data || []);
      setLoading(false);
    };

    fetchFeatured();
  }, []);

  return { events, loading };
}

export function useEventSaves() {
  const { user } = useAuth();
  const [savedEventIds, setSavedEventIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setSavedEventIds(new Set());
      return;
    }

    const fetchSaves = async () => {
      const { data } = await db
        .from('event_saves')
        .select('event_id')
        .eq('user_id', user.id);

      setSavedEventIds(new Set(data?.map((s: { event_id: string }) => s.event_id) || []));
    };

    fetchSaves();
  }, [user]);

  const toggleSave = async (eventId: string) => {
    if (!user) return false;

    setLoading(true);
    const isSaved = savedEventIds.has(eventId);

    try {
      if (isSaved) {
        await db
          .from('event_saves')
          .delete()
          .eq('user_id', user.id)
          .eq('event_id', eventId);

        setSavedEventIds((prev) => {
          const next = new Set(prev);
          next.delete(eventId);
          return next;
        });
      } else {
        await db.from('event_saves').insert({
          user_id: user.id,
          event_id: eventId,
        });

        setSavedEventIds((prev) => new Set(prev).add(eventId));
      }
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { savedEventIds, toggleSave, loading };
}

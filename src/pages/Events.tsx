import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic2, Plus, Calendar as CalendarIcon, List, Sparkles } from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventCard } from '@/components/events/EventCard';
import { EventFilters } from '@/components/events/EventFilters';
import { FeaturedEvents } from '@/components/events/FeaturedEvents';
import { EventCalendarView } from '@/components/events/EventCalendarView';
import { useEvents, useFeaturedEvents, useEventSaves } from '@/hooks/useEvents';
import { Skeleton } from '@/components/ui/skeleton';
import { BottomNav } from '@/components/BottomNav';

export default function Events() {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [city, setCity] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [eventType, setEventType] = useState('all');

  const { events, loading } = useEvents({
    city: city === 'online' ? undefined : city,
    dateFilter: dateFilter as 'today' | 'this_week' | 'this_month' | 'all',
    eventType,
    isOnline: city === 'online' ? true : undefined,
  });

  const { events: featuredEvents, loading: featuredLoading } = useFeaturedEvents();
  const { savedEventIds, toggleSave } = useEventSaves();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-24 px-4 max-w-4xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Mic2 className="h-6 w-6 text-primary" />
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Poetry Events Around the World
            </h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
            Discover open mics, slams, workshops, festivals, and online poetry events.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <Link to="/events/submit">
              <Button variant="default" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Submit an Event
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView(view === 'list' ? 'calendar' : 'list')}
            >
              {view === 'list' ? (
                <>
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  View Calendar
                </>
              ) : (
                <>
                  <List className="h-4 w-4 mr-2" />
                  View List
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <EventFilters
            city={city}
            onCityChange={setCity}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
            eventType={eventType}
            onEventTypeChange={setEventType}
          />
        </motion.div>

        {/* Featured Events */}
        {view === 'list' && (
          <FeaturedEvents events={featuredEvents} loading={featuredLoading} />
        )}

        {/* Main Content */}
        {view === 'list' ? (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold text-foreground">Upcoming Events</h2>
              <span className="text-xs text-muted-foreground">
                ({events.length} found)
              </span>
            </div>

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-56 rounded-xl" />
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-xl">
                <Mic2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">No events found matching your filters.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your search or{' '}
                  <Link to="/events/submit" className="text-primary hover:underline">
                    submit an event
                  </Link>
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isSaved={savedEventIds.has(event.id)}
                    onToggleSave={toggleSave}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          <EventCalendarView events={events} />
        )}
      </main>

      <BottomNav />
    </div>
  );
}

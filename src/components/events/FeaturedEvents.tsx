import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, MapPin, Globe, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Event, EVENT_TYPE_ICONS } from '@/types/event';
import { Skeleton } from '@/components/ui/skeleton';

interface FeaturedEventsProps {
  events: Event[];
  loading: boolean;
}

export function FeaturedEvents({ events, loading }: FeaturedEventsProps) {
  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-72 flex-shrink-0 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-amber-500" />
        <h2 className="font-display text-lg font-semibold text-foreground">
          Featured This Month
        </h2>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              to={`/events/${event.id}`}
              className="group block w-72 flex-shrink-0 bg-gradient-to-br from-amber-500/10 via-primary/5 to-transparent rounded-xl border border-amber-500/20 p-4 hover:border-amber-500/40 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl" role="img">
                  {EVENT_TYPE_ICONS[event.event_type]}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(event.date), 'MMM d')}</span>
                    <span className="mx-1">•</span>
                    {event.is_online ? (
                      <>
                        <Globe className="h-3 w-3" />
                        <span>Online</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{event.city || 'TBA'}</span>
                      </>
                    )}
                  </div>
                  {event.short_description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {event.short_description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-end gap-1 text-xs text-primary mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>View details</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

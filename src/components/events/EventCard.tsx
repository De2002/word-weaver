import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Globe, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Event, EVENT_TYPE_LABELS, EVENT_TYPE_ICONS } from '@/types/event';
import { useAuth } from '@/context/AuthProvider';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: Event;
  isSaved?: boolean;
  onToggleSave?: (eventId: string) => void;
}

export function EventCard({ event, isSaved, onToggleSave }: EventCardProps) {
  const { user } = useAuth();

  const formattedDate = format(new Date(event.date), 'MMM d, yyyy');
  const formattedTime = event.start_time
    ? format(new Date(`2000-01-01T${event.start_time}`), 'h:mm a')
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-card rounded-xl border border-border/50 p-5 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
    >
      {/* Featured badge */}
      {event.is_featured && (
        <div className="absolute -top-2 -right-2">
          <Badge className="bg-amber-500/90 text-white border-0 shadow-md">
            ⭐ Featured
          </Badge>
        </div>
      )}

      {/* Event type icon */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl" role="img" aria-label={EVENT_TYPE_LABELS[event.event_type]}>
          {EVENT_TYPE_ICONS[event.event_type]}
        </span>
        
        {user && onToggleSave && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              onToggleSave(event.id);
            }}
          >
            <Heart
              className={cn(
                'h-4 w-4 transition-colors',
                isSaved ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
              )}
            />
          </Button>
        )}
      </div>

      {/* Title */}
      <h3 className="font-display text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
        {event.title}
      </h3>

      {/* Date & Location */}
      <div className="flex flex-col gap-1.5 mb-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary/70" />
          <span>
            {formattedDate}
            {formattedTime && ` • ${formattedTime}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {event.is_online ? (
            <>
              <Globe className="h-4 w-4 text-primary/70" />
              <span>Online Event</span>
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4 text-primary/70" />
              <span>
                {event.city || event.location || 'Location TBA'}
                {event.country && `, ${event.country}`}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Short description */}
      {event.short_description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {event.short_description}
        </p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="secondary" className="text-xs">
          {EVENT_TYPE_LABELS[event.event_type]}
        </Badge>
        {event.is_free && (
          <Badge variant="outline" className="text-xs border-green-500/50 text-green-600">
            Free
          </Badge>
        )}
        {event.tags.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>

      {/* Action */}
      <Link to={`/events/${event.id}`}>
        <Button variant="outline" size="sm" className="w-full">
          View Details
        </Button>
      </Link>
    </motion.div>
  );
}

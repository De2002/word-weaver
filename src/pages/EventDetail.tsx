import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Globe,
  User,
  Mail,
  Heart,
  Share2,
  ExternalLink,
  CalendarPlus,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { db } from '@/lib/db';
import { Event, EVENT_TYPE_LABELS, EVENT_TYPE_ICONS } from '@/types/event';
import { useAuth } from '@/context/AuthProvider';
import { useEventSaves } from '@/hooks/useEvents';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const { savedEventIds, toggleSave } = useEventSaves();

  // Dynamic SEO
  useEffect(() => {
    if (event) {
      document.title = `${event.title} | WordStack Events`;
    }
    return () => { document.title = 'WordStack'; };
  }, [event]);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;

      const { data, error } = await db
        .from('events')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        navigate('/events');
        return;
      }

      setEvent(data);
      setLoading(false);
    };

    fetchEvent();
  }, [id, navigate]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: event?.short_description || 'Check out this poetry event!',
          url,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleAddToCalendar = () => {
    if (!event) return;

    const startDate = event.start_time
      ? `${event.date}T${event.start_time}`
      : event.date;
    const endDate = event.end_time
      ? `${event.date}T${event.end_time}`
      : event.date;

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title
    )}&dates=${startDate.replace(/[-:]/g, '')}/${endDate.replace(
      /[-:]/g,
      ''
    )}&details=${encodeURIComponent(
      event.short_description || event.description
    )}&location=${encodeURIComponent(
      event.is_online ? event.online_link || 'Online' : event.location || ''
    )}`;

    window.open(googleCalendarUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-24 px-4 max-w-2xl mx-auto">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-6 w-64 mb-6" />
          <Skeleton className="h-40 w-full" />
        </main>
      </div>
    );
  }

  if (!event) return null;

  const formattedDate = format(new Date(event.date), 'EEEE, MMMM d, yyyy');
  const formattedStartTime = event.start_time
    ? format(new Date(`2000-01-01T${event.start_time}`), 'h:mm a')
    : null;
  const formattedEndTime = event.end_time
    ? format(new Date(`2000-01-01T${event.end_time}`), 'h:mm a')
    : null;

  const isSaved = savedEventIds.has(event.id);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-24 px-4 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            className="mb-4"
            onClick={() => navigate('/events')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>

          {/* Featured badge */}
          {event.is_featured && (
            <Badge className="bg-amber-500/90 text-white border-0 mb-4">
              ⭐ Featured Event
            </Badge>
          )}

          {/* Title */}
          <div className="flex items-start gap-3 mb-4">
            <span className="text-4xl" role="img">
              {EVENT_TYPE_ICONS[event.event_type]}
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              {event.title}
            </h1>
          </div>

          {/* Meta info */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-foreground">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="font-medium">{formattedDate}</span>
            </div>

            {(formattedStartTime || formattedEndTime) && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Clock className="h-5 w-5 text-primary/70" />
                <span>
                  {formattedStartTime}
                  {formattedEndTime && ` – ${formattedEndTime}`}
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 text-muted-foreground">
              {event.is_online ? (
                <>
                  <Globe className="h-5 w-5 text-primary/70" />
                  <span>Online Event</span>
                  {event.online_link && (
                    <a
                      href={event.online_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      Join Link <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </>
              ) : (
                <>
                  <MapPin className="h-5 w-5 text-primary/70" />
                  <span>
                    {event.location || event.city || 'Location TBA'}
                    {event.city && event.country && `, ${event.country}`}
                  </span>
                </>
              )}
            </div>

            {event.organizer_name && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <User className="h-5 w-5 text-primary/70" />
                <span>Organized by {event.organizer_name}</span>
              </div>
            )}

            {event.organizer_contact && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-5 w-5 text-primary/70" />
                <a
                  href={`mailto:${event.organizer_contact}`}
                  className="text-primary hover:underline"
                >
                  {event.organizer_contact}
                </a>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="secondary">{EVENT_TYPE_LABELS[event.event_type]}</Badge>
            {event.is_free && (
              <Badge variant="outline" className="border-green-500/50 text-green-600">
                Free
              </Badge>
            )}
            {event.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-8">
            {user && (
              <Button
                variant={isSaved ? 'default' : 'outline'}
                onClick={() => toggleSave(event.id)}
              >
                <Heart
                  className={cn(
                    'h-4 w-4 mr-2',
                    isSaved && 'fill-current'
                  )}
                />
                {isSaved ? 'Saved' : 'Save Event'}
              </Button>
            )}

            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>

            <Button variant="outline" onClick={handleAddToCalendar}>
              <CalendarPlus className="h-4 w-4 mr-2" />
              Add to Calendar
            </Button>
          </div>

          {/* Description */}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <h2 className="font-display text-lg font-semibold mb-3">About This Event</h2>
            <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Map placeholder for physical events */}
          {!event.is_online && event.location && (
            <div className="mt-8 p-6 bg-muted/30 rounded-xl text-center">
              <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {event.location}
                {event.city && `, ${event.city}`}
                {event.country && `, ${event.country}`}
              </p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${event.location || ''} ${event.city || ''} ${event.country || ''}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary text-sm hover:underline mt-2 inline-block"
              >
                View on Google Maps →
              </a>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

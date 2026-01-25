import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Event, EVENT_TYPE_ICONS } from '@/types/event';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface EventCalendarViewProps {
  events: Event[];
}

export function EventCalendarView({ events }: EventCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad the start to align with week
  const startDay = monthStart.getDay();
  const paddedDays = Array(startDay).fill(null).concat(days);

  const getEventsForDay = (date: Date) =>
    events.filter((event) => isSameDay(new Date(event.date), date));

  return (
    <div className="bg-card rounded-xl border border-border/50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-display font-semibold text-lg">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs text-muted-foreground font-medium py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {paddedDays.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dayEvents = getEventsForDay(day);
          const hasEvents = dayEvents.length > 0;

          return (
            <div
              key={day.toISOString()}
              className={cn(
                'aspect-square p-1 rounded-lg text-center relative group transition-colors',
                !isSameMonth(day, currentMonth) && 'opacity-40',
                isToday(day) && 'bg-primary/10 ring-1 ring-primary/30',
                hasEvents && 'cursor-pointer hover:bg-muted'
              )}
            >
              <span
                className={cn(
                  'text-sm',
                  isToday(day) && 'font-bold text-primary'
                )}
              >
                {format(day, 'd')}
              </span>

              {/* Event indicators */}
              {hasEvents && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {dayEvents.slice(0, 3).map((event) => (
                    <span key={event.id} className="text-[10px]">
                      {EVENT_TYPE_ICONS[event.event_type]}
                    </span>
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">+{dayEvents.length - 3}</span>
                  )}
                </div>
              )}

              {/* Hover popup */}
              {hasEvents && (
                <div className="absolute z-10 left-1/2 -translate-x-1/2 top-full mt-1 w-48 bg-popover border border-border rounded-lg shadow-lg p-2 hidden group-hover:block">
                  {dayEvents.slice(0, 3).map((event) => (
                    <Link
                      key={event.id}
                      to={`/events/${event.id}`}
                      className="block text-xs text-left p-1.5 hover:bg-muted rounded transition-colors"
                    >
                      <span className="mr-1">{EVENT_TYPE_ICONS[event.event_type]}</span>
                      <span className="line-clamp-1">{event.title}</span>
                    </Link>
                  ))}
                  {dayEvents.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      +{dayEvents.length - 3} more
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

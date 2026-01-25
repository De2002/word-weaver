import { MapPin, Calendar, Theater } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EVENT_TYPE_LABELS, EventType } from '@/types/event';

interface EventFiltersProps {
  city: string;
  onCityChange: (city: string) => void;
  dateFilter: string;
  onDateFilterChange: (filter: string) => void;
  eventType: string;
  onEventTypeChange: (type: string) => void;
}

export function EventFilters({
  city,
  onCityChange,
  dateFilter,
  onDateFilterChange,
  eventType,
  onEventTypeChange,
}: EventFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {/* Location filter */}
      <div className="relative flex-1 min-w-[180px]">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="City or Online"
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Date filter */}
      <Select value={dateFilter} onValueChange={onDateFilterChange}>
        <SelectTrigger className="w-[160px]">
          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
          <SelectValue placeholder="When" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Upcoming</SelectItem>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="this_week">This Week</SelectItem>
          <SelectItem value="this_month">This Month</SelectItem>
        </SelectContent>
      </Select>

      {/* Event type filter */}
      <Select value={eventType} onValueChange={onEventTypeChange}>
        <SelectTrigger className="w-[160px]">
          <Theater className="h-4 w-4 mr-2 text-muted-foreground" />
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {(Object.entries(EVENT_TYPE_LABELS) as [EventType, string][]).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Online toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onCityChange(city === 'online' ? '' : 'online')}
        className={city === 'online' ? 'bg-primary/10 border-primary' : ''}
      >
        🌐 Online Only
      </Button>
    </div>
  );
}

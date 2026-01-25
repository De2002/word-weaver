export type EventType = 'open_mic' | 'slam' | 'workshop' | 'festival' | 'virtual';

export interface Event {
  id: string;
  user_id: string;
  title: string;
  description: string;
  short_description?: string;
  event_type: EventType;
  date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  city?: string;
  country?: string;
  is_online: boolean;
  online_link?: string;
  organizer_name?: string;
  organizer_contact?: string;
  is_featured: boolean;
  is_free: boolean;
  tags: string[];
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface EventSave {
  id: string;
  user_id: string;
  event_id: string;
  created_at: string;
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  open_mic: 'Open Mic',
  slam: 'Slam',
  workshop: 'Workshop',
  festival: 'Festival',
  virtual: 'Virtual Event',
};

export const EVENT_TYPE_ICONS: Record<EventType, string> = {
  open_mic: '🎤',
  slam: '🔥',
  workshop: '📚',
  festival: '🎭',
  virtual: '💻',
};

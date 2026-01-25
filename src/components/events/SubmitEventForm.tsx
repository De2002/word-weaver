import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, MapPin, Globe, User, Mail, Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/context/AuthProvider';
import { db } from '@/lib/db';
import { toast } from 'sonner';
import { EVENT_TYPE_LABELS, EventType } from '@/types/event';
import { Header } from '@/components/Header';

const submitEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  event_type: z.enum(['open_mic', 'slam', 'workshop', 'festival', 'virtual']),
  date: z.string().min(1, 'Date is required'),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  is_online: z.boolean(),
  location: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  online_link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  short_description: z.string().max(150, 'Keep it under 150 characters').optional(),
  description: z.string().min(20, 'Please provide more details').max(2000),
  organizer_name: z.string().max(100).optional(),
  organizer_contact: z.string().email('Must be a valid email').optional().or(z.literal('')),
  is_free: z.boolean(),
  tags: z.string().optional(),
});

type SubmitEventFormValues = z.infer<typeof submitEventSchema>;

export function SubmitEventForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<SubmitEventFormValues>({
    resolver: zodResolver(submitEventSchema),
    defaultValues: {
      title: '',
      event_type: 'open_mic',
      date: '',
      start_time: '',
      end_time: '',
      is_online: false,
      location: '',
      city: '',
      country: '',
      online_link: '',
      short_description: '',
      description: '',
      organizer_name: '',
      organizer_contact: '',
      is_free: true,
      tags: '',
    },
  });

  const isOnline = form.watch('is_online');

  const onSubmit = async (values: SubmitEventFormValues) => {
    if (!user) {
      toast.error('Please log in to submit an event');
      return;
    }

    setSubmitting(true);

    try {
      const tags = values.tags
        ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      const { error } = await db.from('events').insert({
        user_id: user.id,
        title: values.title,
        event_type: values.event_type,
        date: values.date,
        start_time: values.start_time || null,
        end_time: values.end_time || null,
        is_online: values.is_online,
        location: values.is_online ? null : values.location,
        city: values.is_online ? null : values.city,
        country: values.is_online ? null : values.country,
        online_link: values.is_online ? values.online_link : null,
        short_description: values.short_description || null,
        description: values.description,
        organizer_name: values.organizer_name || null,
        organizer_contact: values.organizer_contact || null,
        is_free: values.is_free,
        tags,
        status: 'pending',
      });

      if (error) throw error;

      toast.success('Event submitted! It will be reviewed shortly.');
      navigate('/events');
    } catch (err) {
      toast.error('Failed to submit event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 px-4 text-center">
          <p className="text-muted-foreground">Please log in to submit an event.</p>
          <Button className="mt-4" onClick={() => navigate('/login')}>
            Log In
          </Button>
        </div>
      </div>
    );
  }

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

          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              ➕ Submit an Event
            </h1>
            <p className="text-muted-foreground text-sm">
              Share poetry events with the community
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Event Name */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Open Mic Poetry Night" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Event Type */}
              <FormField
                control={form.control}
                name="event_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.entries(EVENT_TYPE_LABELS) as [EventType, string][]).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Online toggle */}
              <FormField
                control={form.control}
                name="is_online"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Online Event
                      </FormLabel>
                      <FormDescription>
                        This event will be held virtually
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Location or Online Link */}
              {isOnline ? (
                <FormField
                  control={form.control}
                  name="online_link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Join Link</FormLabel>
                      <FormControl>
                        <Input placeholder="https://zoom.us/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Venue / Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Community Center, 123 Main St" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Nairobi" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="Kenya" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Short description */}
              <FormField
                control={form.control}
                name="short_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="A friendly open mic for new and experienced poets"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Brief tagline for the event card (max 150 chars)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Full description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us more about this event..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Organizer info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="organizer_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Organizer Name
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="organizer_contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Contact Email
                      </FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="jane@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Free toggle */}
              <FormField
                control={form.control}
                name="is_free"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Free Event</FormLabel>
                      <FormDescription>This event is free to attend</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Tags */}
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input placeholder="spoken word, beginners welcome, LGBTQ+" {...field} />
                    </FormControl>
                    <FormDescription>Separate tags with commas</FormDescription>
                  </FormItem>
                )}
              />

              {/* Submit */}
              <Button type="submit" className="w-full" disabled={submitting}>
                <Send className="h-4 w-4 mr-2" />
                {submitting ? 'Submitting...' : 'Publish Event'}
              </Button>
            </form>
          </Form>
        </motion.div>
      </main>
    </div>
  );
}

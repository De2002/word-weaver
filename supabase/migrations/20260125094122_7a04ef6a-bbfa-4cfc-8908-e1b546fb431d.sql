-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('open_mic', 'slam', 'workshop', 'festival', 'virtual')),
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,
  city TEXT,
  country TEXT,
  is_online BOOLEAN NOT NULL DEFAULT false,
  online_link TEXT,
  organizer_name TEXT,
  organizer_contact TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_free BOOLEAN NOT NULL DEFAULT true,
  tags TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event saves table
CREATE TABLE public.event_saves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_saves ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Anyone can view approved events"
ON public.events FOR SELECT
USING (status = 'approved');

CREATE POLICY "Users can view own submitted events"
ON public.events FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can submit events"
ON public.events FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events"
ON public.events FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events"
ON public.events FOR DELETE
USING (auth.uid() = user_id);

-- Event saves policies
CREATE POLICY "Users can view own saves"
ON public.event_saves FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can save events"
ON public.event_saves FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave events"
ON public.event_saves FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for events
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
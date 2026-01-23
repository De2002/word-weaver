-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('follow', 'upvote', 'comment', 'reply')),
  actor_id UUID NOT NULL,
  poem_id UUID REFERENCES public.poems(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update (mark as read) their own notifications
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- System can insert notifications (via triggers)
CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);

-- Function to create follow notification
CREATE OR REPLACE FUNCTION public.create_follow_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Don't notify yourself
  IF NEW.follower_id != NEW.following_id THEN
    INSERT INTO public.notifications (user_id, type, actor_id)
    VALUES (NEW.following_id, 'follow', NEW.follower_id);
  END IF;
  RETURN NEW;
END;
$$;

-- Function to create upvote notification
CREATE OR REPLACE FUNCTION public.create_upvote_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  poem_owner_id UUID;
BEGIN
  -- Get the poem owner
  SELECT user_id INTO poem_owner_id FROM public.poems WHERE id = NEW.poem_id;
  
  -- Don't notify yourself
  IF NEW.user_id != poem_owner_id THEN
    INSERT INTO public.notifications (user_id, type, actor_id, poem_id)
    VALUES (poem_owner_id, 'upvote', NEW.user_id, NEW.poem_id);
  END IF;
  RETURN NEW;
END;
$$;

-- Function to create comment notification
CREATE OR REPLACE FUNCTION public.create_comment_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  poem_owner_id UUID;
  parent_comment_owner_id UUID;
BEGIN
  -- Get the poem owner
  SELECT user_id INTO poem_owner_id FROM public.poems WHERE id = NEW.poem_id;
  
  -- If this is a reply, notify the parent comment author
  IF NEW.parent_id IS NOT NULL THEN
    SELECT user_id INTO parent_comment_owner_id FROM public.comments WHERE id = NEW.parent_id;
    
    -- Notify parent comment author (if not self)
    IF NEW.user_id != parent_comment_owner_id THEN
      INSERT INTO public.notifications (user_id, type, actor_id, poem_id, comment_id)
      VALUES (parent_comment_owner_id, 'reply', NEW.user_id, NEW.poem_id, NEW.id);
    END IF;
  END IF;
  
  -- Notify poem owner (if not self and not already notified as reply recipient)
  IF NEW.user_id != poem_owner_id AND (NEW.parent_id IS NULL OR poem_owner_id != parent_comment_owner_id) THEN
    INSERT INTO public.notifications (user_id, type, actor_id, poem_id, comment_id)
    VALUES (poem_owner_id, 'comment', NEW.user_id, NEW.poem_id, NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER on_follow_create_notification
  AFTER INSERT ON public.follows
  FOR EACH ROW
  EXECUTE FUNCTION public.create_follow_notification();

CREATE TRIGGER on_upvote_create_notification
  AFTER INSERT ON public.poem_upvotes
  FOR EACH ROW
  EXECUTE FUNCTION public.create_upvote_notification();

CREATE TRIGGER on_comment_create_notification
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.create_comment_notification();
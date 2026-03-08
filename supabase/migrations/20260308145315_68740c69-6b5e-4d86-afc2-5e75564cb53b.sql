
-- Add question_id column to notifications for Q&A deep-linking
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS question_id UUID REFERENCES public.qa_questions(id) ON DELETE CASCADE;

-- Trigger function: notify question author when a Pro Poet posts an answer
CREATE OR REPLACE FUNCTION public.create_qa_answer_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  question_author_id UUID;
BEGIN
  -- Get the question author
  SELECT user_id INTO question_author_id
  FROM public.qa_questions
  WHERE id = NEW.question_id;

  -- Don't notify yourself
  IF NEW.user_id != question_author_id THEN
    INSERT INTO public.notifications (user_id, type, actor_id, question_id)
    VALUES (question_author_id, 'qa_answer', NEW.user_id, NEW.question_id);
  END IF;

  RETURN NEW;
END;
$$;

-- Attach trigger to qa_answers
CREATE TRIGGER on_qa_answer_inserted
  AFTER INSERT ON public.qa_answers
  FOR EACH ROW
  EXECUTE FUNCTION public.create_qa_answer_notification();

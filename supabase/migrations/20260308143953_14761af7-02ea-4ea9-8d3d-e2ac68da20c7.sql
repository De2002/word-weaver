
-- Q&A Questions table
CREATE TABLE public.qa_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  details TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  views INTEGER NOT NULL DEFAULT 0,
  accepted_answer_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.qa_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view questions"
  ON public.qa_questions FOR SELECT USING (true);

CREATE POLICY "Authenticated users can ask questions"
  ON public.qa_questions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own questions"
  ON public.qa_questions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own questions"
  ON public.qa_questions FOR DELETE
  USING (auth.uid() = user_id);

-- Q&A Answers table (only pro poets can answer)
CREATE TABLE public.qa_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.qa_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_accepted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.qa_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view answers"
  ON public.qa_answers FOR SELECT USING (true);

CREATE POLICY "Pro poets can post answers"
  ON public.qa_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id AND has_role(auth.uid(), 'pro'::app_role));

CREATE POLICY "Users can update own answers"
  ON public.qa_answers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own answers"
  ON public.qa_answers FOR DELETE
  USING (auth.uid() = user_id);

-- Add FK from questions to accepted answer
ALTER TABLE public.qa_questions
  ADD CONSTRAINT qa_questions_accepted_answer_id_fkey
  FOREIGN KEY (accepted_answer_id) REFERENCES public.qa_answers(id) ON DELETE SET NULL;

-- Q&A Answer Votes table
CREATE TABLE public.qa_answer_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  answer_id UUID NOT NULL REFERENCES public.qa_answers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (answer_id, user_id)
);

ALTER TABLE public.qa_answer_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view answer votes"
  ON public.qa_answer_votes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote"
  ON public.qa_answer_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own vote"
  ON public.qa_answer_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Timestamps trigger for questions
CREATE TRIGGER update_qa_questions_updated_at
  BEFORE UPDATE ON public.qa_questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Timestamps trigger for answers
CREATE TRIGGER update_qa_answers_updated_at
  BEFORE UPDATE ON public.qa_answers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

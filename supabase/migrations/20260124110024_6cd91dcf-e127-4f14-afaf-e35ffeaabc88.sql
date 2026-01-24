-- Enable realtime for comments, poem_upvotes, poem_saves, and comment_likes tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.poem_upvotes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.poem_saves;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comment_likes;
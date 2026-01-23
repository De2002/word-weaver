import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { db } from '@/lib/db';
import { useAuth } from '@/context/AuthProvider';
import { toast } from '@/hooks/use-toast';

// Validation schema for comment content
const commentSchema = z.object({
  content: z.string()
    .trim()
    .min(1, { message: "Comment cannot be empty" })
    .max(1000, { message: "Comment must be less than 1000 characters" }),
});

export interface Comment {
  id: string;
  poemId: string;
  userId: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  likeCount: number;
  isLiked: boolean;
  replies: Comment[];
}

interface DbComment {
  id: string;
  poem_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

interface DbProfile {
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
}

interface UseCommentsResult {
  comments: Comment[];
  commentCount: number;
  isLoading: boolean;
  error: Error | null;
  addComment: (content: string, parentId?: string) => void;
  deleteComment: (commentId: string) => void;
  toggleLike: (commentId: string) => void;
  isAddingComment: boolean;
}

export function useComments(poemId: string): UseCommentsResult {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const userId = session?.user?.id;

  // Fetch comments with profiles
  const { data, isLoading, error } = useQuery({
    queryKey: ['comments', poemId],
    queryFn: async () => {
      // Fetch all comments for this poem
      const { data: commentsData, error: commentsError } = await db
        .from('comments')
        .select('*')
        .eq('poem_id', poemId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;
      if (!commentsData || commentsData.length === 0) return [];

      // Get unique user IDs and fetch profiles
      const userIds = [...new Set(commentsData.map((c: DbComment) => c.user_id))];
      const { data: profilesData } = await db
        .from('profiles')
        .select('user_id, username, display_name, avatar_url')
        .in('user_id', userIds);

      const profilesMap = new Map<string, DbProfile>();
      (profilesData || []).forEach((p: DbProfile) => {
        profilesMap.set(p.user_id, p);
      });

      // Fetch like counts for all comments
      const commentIds = commentsData.map((c: DbComment) => c.id);
      const { data: likesData } = await db
        .from('comment_likes')
        .select('comment_id')
        .in('comment_id', commentIds);

      const likeCounts = new Map<string, number>();
      (likesData || []).forEach((like: { comment_id: string }) => {
        likeCounts.set(like.comment_id, (likeCounts.get(like.comment_id) || 0) + 1);
      });

      // Check which comments the current user has liked
      const userLikes = new Set<string>();
      if (userId) {
        const { data: userLikesData } = await db
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', userId)
          .in('comment_id', commentIds);

        (userLikesData || []).forEach((like: { comment_id: string }) => {
          userLikes.add(like.comment_id);
        });
      }

      // Transform comments
      const transformedComments: Comment[] = commentsData.map((c: DbComment) => {
        const profile = profilesMap.get(c.user_id);
        return {
          id: c.id,
          poemId: c.poem_id,
          userId: c.user_id,
          parentId: c.parent_id,
          content: c.content,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
          author: {
            name: profile?.display_name || profile?.username || 'Anonymous',
            username: profile?.username || 'anonymous',
            avatar: profile?.avatar_url || '',
          },
          likeCount: likeCounts.get(c.id) || 0,
          isLiked: userLikes.has(c.id),
          replies: [],
        };
      });

      // Build nested structure (replies)
      const commentMap = new Map<string, Comment>();
      const rootComments: Comment[] = [];

      transformedComments.forEach(comment => {
        commentMap.set(comment.id, comment);
      });

      transformedComments.forEach(comment => {
        if (comment.parentId) {
          const parent = commentMap.get(comment.parentId);
          if (parent) {
            parent.replies.push(comment);
          }
        } else {
          rootComments.push(comment);
        }
      });

      // Sort root comments by newest first, replies by oldest first
      rootComments.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return rootComments;
    },
    enabled: !!poemId,
  });

  // Get total comment count
  const { data: commentCount } = useQuery({
    queryKey: ['comment-count', poemId],
    queryFn: async () => {
      const { count, error } = await db
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('poem_id', poemId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!poemId,
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: string }) => {
      if (!userId) throw new Error('Must be logged in to comment');

      // Validate content
      const result = commentSchema.safeParse({ content });
      if (!result.success) {
        throw new Error(result.error.errors[0].message);
      }

      const { error } = await db
        .from('comments')
        .insert({
          poem_id: poemId,
          user_id: userId,
          parent_id: parentId || null,
          content: result.data.content,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', poemId] });
      queryClient.invalidateQueries({ queryKey: ['comment-count', poemId] });
      toast({ title: 'Comment added', description: 'Your comment has been posted.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      if (!userId) throw new Error('Must be logged in');

      const { error } = await db
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', poemId] });
      queryClient.invalidateQueries({ queryKey: ['comment-count', poemId] });
      toast({ title: 'Comment deleted' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Toggle like mutation
  const toggleLikeMutation = useMutation({
    mutationFn: async ({ commentId, isLiked }: { commentId: string; isLiked: boolean }) => {
      if (!userId) throw new Error('Must be logged in to like comments');

      if (isLiked) {
        const { error } = await db
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await db
          .from('comment_likes')
          .insert({ comment_id: commentId, user_id: userId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', poemId] });
    },
  });

  const addComment = useCallback((content: string, parentId?: string) => {
    if (!userId) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to comment.',
        variant: 'destructive',
      });
      return;
    }
    addCommentMutation.mutate({ content, parentId });
  }, [userId, addCommentMutation]);

  const deleteComment = useCallback((commentId: string) => {
    deleteCommentMutation.mutate(commentId);
  }, [deleteCommentMutation]);

  const toggleLike = useCallback((commentId: string) => {
    if (!userId) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to like comments.',
        variant: 'destructive',
      });
      return;
    }
    const comment = findComment(data || [], commentId);
    if (comment) {
      toggleLikeMutation.mutate({ commentId, isLiked: comment.isLiked });
    }
  }, [userId, data, toggleLikeMutation]);

  return {
    comments: data || [],
    commentCount: commentCount || 0,
    isLoading,
    error: error as Error | null,
    addComment,
    deleteComment,
    toggleLike,
    isAddingComment: addCommentMutation.isPending,
  };
}

// Helper to find a comment in nested structure
function findComment(comments: Comment[], id: string): Comment | null {
  for (const comment of comments) {
    if (comment.id === id) return comment;
    const found = findComment(comment.replies, id);
    if (found) return found;
  }
  return null;
}

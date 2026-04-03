import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/db';
import { useAuth } from '@/context/AuthProvider';
import { QAQuestion, QACategory, QAPoet } from '@/types/qa';

const PAGE_SIZE = 15;

interface UseQAOptions {
  category?: QACategory | 'all';
  search?: string;
  featured?: boolean;
}

export function useQA(options: UseQAOptions = {}) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QAQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const fetchQuestions = useCallback(async (pageNum: number, append = false) => {
    try {
      if (pageNum === 0) setIsLoading(true);
      else setIsLoadingMore(true);

      const from = pageNum * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = db
        .from('qa_questions')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (options.category && options.category !== 'all') {
        query = query.eq('category', options.category);
      }
      if (options.featured) {
        query = query.eq('is_featured', true);
      }
      if (options.search?.trim()) {
        query = query.ilike('title', `%${options.search.trim()}%`);
      }

      const { data: questionsData, error } = await query;
      if (error) throw error;
      if (!questionsData || questionsData.length === 0) {
        if (!append) setQuestions([]);
        setHasMore(false);
        return;
      }

      // Fetch profiles
      const userIds = [...new Set(questionsData.map((q: any) => q.user_id))];
      const { data: profilesData } = await db
        .from('profiles')
        .select('user_id, username, display_name, avatar_url')
        .in('user_id', userIds);

      // Fetch pro roles
      const { data: proRoles } = await db
        .from('user_roles')
        .select('user_id')
        .eq('role', 'pro')
        .in('user_id', userIds);

      const proSet = new Set((proRoles || []).map((r: any) => r.user_id));
      const profilesMap = new Map<string, any>();
      (profilesData || []).forEach((p: any) => profilesMap.set(p.user_id, p));

      // Fetch answer counts
      const questionIds = questionsData.map((q: any) => q.id);
      const { data: answerCounts } = await db
        .from('qa_answers')
        .select('question_id')
        .in('question_id', questionIds);

      const countMap = new Map<string, number>();
      (answerCounts || []).forEach((a: any) => {
        countMap.set(a.question_id, (countMap.get(a.question_id) || 0) + 1);
      });

      const mapped: QAQuestion[] = questionsData.map((q: any) => {
        const profile = profilesMap.get(q.user_id);
        const poet: QAPoet = {
          id: q.user_id,
          username: profile?.username || 'anonymous',
          display_name: profile?.display_name || null,
          avatar_url: profile?.avatar_url || null,
          is_pro: proSet.has(q.user_id),
        };
        return {
          ...q,
          answer_count: countMap.get(q.id) || 0,
          poet,
        };
      });

      if (append) setQuestions(prev => [...prev, ...mapped]);
      else setQuestions(mapped);
      setHasMore(mapped.length === PAGE_SIZE);
    } catch (err) {
      console.error('useQA error:', err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [options.category, options.search, options.featured]);

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchQuestions(0);
  }, [fetchQuestions]);

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      const next = page + 1;
      setPage(next);
      fetchQuestions(next, true);
    }
  }, [isLoadingMore, hasMore, page, fetchQuestions]);

  const refresh = useCallback(() => {
    setPage(0);
    setHasMore(true);
    fetchQuestions(0);
  }, [fetchQuestions]);

  const askQuestion = useCallback(async (
    title: string,
    details: string,
    category: QACategory
  ) => {
    if (!user) throw new Error('Must be logged in');
    const { data: slugData, error: slugError } = await db.rpc('generate_qa_question_slug', {
      title_input: title,
    });
    if (slugError) throw slugError;

    const { data, error } = await db
      .from('qa_questions')
      .insert({ user_id: user.id, title, details, category, slug: slugData as string })
      .select()
      .single();
    if (error) throw error;
    refresh();
    return data;
  }, [user, refresh]);

  return { questions, isLoading, isLoadingMore, hasMore, loadMore, refresh, askQuestion };
}

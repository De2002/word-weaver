import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/db';
import { useAuth } from '@/context/AuthProvider';
import { QAQuestion, QAAnswer, QAPoet } from '@/types/qa';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function useQAQuestion(questionIdentifier: string) {
  const { user } = useAuth();
  const [question, setQuestion] = useState<QAQuestion | null>(null);
  const [answers, setAnswers] = useState<QAAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!questionIdentifier) return;
    setIsLoading(true);
    try {
      // Fetch question
      const isUuid = UUID_REGEX.test(questionIdentifier);
      let query = db.from('qa_questions').select('*');
      query = isUuid ? query.eq('id', questionIdentifier) : query.eq('slug', questionIdentifier);

      const { data: q, error: qErr } = await query.single();
      if (qErr) throw qErr;

      // Increment view count
      await db
        .from('qa_questions')
        .update({ views: (q.views || 0) + 1 })
        .eq('id', q.id);

      // Fetch answers
      const { data: answersData } = await db
        .from('qa_answers')
        .select('*')
        .eq('question_id', q.id)
        .order('is_accepted', { ascending: false })
        .order('created_at', { ascending: true });

      const allUserIds = [
        q.user_id,
        ...((answersData || []).map((a: any) => a.user_id)),
      ];
      const uniqueIds = [...new Set(allUserIds)];

      const { data: profilesData } = await db
        .from('profiles')
        .select('user_id, username, display_name, avatar_url')
        .in('user_id', uniqueIds);

      const { data: proRoles } = await db
        .from('user_roles')
        .select('user_id')
        .eq('role', 'pro')
        .in('user_id', uniqueIds);

      const proSet = new Set((proRoles || []).map((r: any) => r.user_id));
      const profilesMap = new Map<string, any>();
      (profilesData || []).forEach((p: any) => profilesMap.set(p.user_id, p));

      const makePoet = (userId: string): QAPoet => {
        const profile = profilesMap.get(userId);
        return {
          id: userId,
          username: profile?.username || 'anonymous',
          display_name: profile?.display_name || null,
          avatar_url: profile?.avatar_url || null,
          is_pro: proSet.has(userId),
        };
      };

      // Fetch votes for all answers
      const answerIds = (answersData || []).map((a: any) => a.id);
      const { data: votesData } = answerIds.length > 0
        ? await db.from('qa_answer_votes').select('answer_id, user_id').in('answer_id', answerIds)
        : { data: [] };

      const voteMap = new Map<string, number>();
      const myVotes = new Set<string>();
      (votesData || []).forEach((v: any) => {
        voteMap.set(v.answer_id, (voteMap.get(v.answer_id) || 0) + 1);
        if (user && v.user_id === user.id) myVotes.add(v.answer_id);
      });

      const mappedAnswers: QAAnswer[] = (answersData || []).map((a: any) => ({
        ...a,
        vote_count: voteMap.get(a.id) || 0,
        has_voted: myVotes.has(a.id),
        poet: makePoet(a.user_id),
      }));

      setQuestion({
        ...q,
        answer_count: mappedAnswers.length,
        poet: makePoet(q.user_id),
      });
      setAnswers(mappedAnswers);
    } catch (err) {
      console.error('useQAQuestion error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [questionIdentifier, user?.id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const postAnswer = useCallback(async (content: string) => {
    if (!user || !question) throw new Error('Must be logged in');
    const { error } = await db
      .from('qa_answers')
      .insert({ question_id: question.id, user_id: user.id, content });
    if (error) throw error;
    fetchAll();
  }, [user, question, fetchAll]);

  const toggleVote = useCallback(async (answerId: string, hasVoted: boolean) => {
    if (!user) throw new Error('Must be logged in');
    if (hasVoted) {
      await db.from('qa_answer_votes').delete()
        .eq('answer_id', answerId).eq('user_id', user.id);
    } else {
      await db.from('qa_answer_votes').insert({ answer_id: answerId, user_id: user.id });
    }
    fetchAll();
  }, [user, fetchAll]);

  const acceptAnswer = useCallback(async (answerId: string) => {
    if (!user || !question || question.user_id !== user.id) return;
    // Toggle accepted
    const newId = question.accepted_answer_id === answerId ? null : answerId;
    await db.from('qa_questions').update({ accepted_answer_id: newId }).eq('id', question.id);
    await db.from('qa_answers').update({ is_accepted: false }).eq('question_id', question.id);
    if (newId) {
      await db.from('qa_answers').update({ is_accepted: true }).eq('id', newId);
    }
    fetchAll();
  }, [user, question, fetchAll]);

  return { question, answers, isLoading, postAnswer, toggleVote, acceptAnswer, refresh: fetchAll };
}

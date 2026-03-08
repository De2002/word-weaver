import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/db";

interface AdminStats {
  totalUsers: number;
  publishedPoems: number;
  approvedEvents: number;
  publishedTrails: number;
  pendingReports: number;
}

interface QAStats {
  totalQuestions: number;
  totalAnswers: number;
  unansweredQuestions: number;
}

interface TopAnswerer {
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  answer_count: number;
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async (): Promise<AdminStats> => {
      const [
        usersResult,
        poemsResult,
        eventsResult,
        trailsResult,
        reportsResult,
      ] = await Promise.all([
        supabase.from("profiles").select("user_id", { count: "exact", head: true }),
        supabase.from("poems").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("events").select("id", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("trails").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("message_reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);

      return {
        totalUsers: usersResult.count ?? 0,
        publishedPoems: poemsResult.count ?? 0,
        approvedEvents: eventsResult.count ?? 0,
        publishedTrails: trailsResult.count ?? 0,
        pendingReports: reportsResult.count ?? 0,
      };
    },
    staleTime: 30000,
  });
}

export function useAdminQAStats() {
  return useQuery({
    queryKey: ["admin-qa-stats"],
    queryFn: async (): Promise<QAStats> => {
      const [questionsResult, answersResult] = await Promise.all([
        db.from("qa_questions").select("id", { count: "exact", head: true }),
        db.from("qa_answers").select("id", { count: "exact", head: true }),
      ]);

      // Find unanswered: questions with accepted_answer_id = null and answer_count = 0
      const { data: answeredIds } = await db
        .from("qa_answers")
        .select("question_id");

      const answeredSet = new Set((answeredIds || []).map((a: any) => a.question_id));

      const { data: allQuestions } = await db
        .from("qa_questions")
        .select("id");

      const unanswered = (allQuestions || []).filter((q: any) => !answeredSet.has(q.id)).length;

      return {
        totalQuestions: questionsResult.count ?? 0,
        totalAnswers: answersResult.count ?? 0,
        unansweredQuestions: unanswered,
      };
    },
    staleTime: 30000,
  });
}

export function useAdminTopAnswerers() {
  return useQuery({
    queryKey: ["admin-top-answerers"],
    queryFn: async (): Promise<TopAnswerer[]> => {
      // Get all answers with user_id
      const { data: answers } = await db
        .from("qa_answers")
        .select("user_id");

      if (!answers || answers.length === 0) return [];

      // Count answers per user
      const countMap = new Map<string, number>();
      (answers as any[]).forEach((a) => {
        countMap.set(a.user_id, (countMap.get(a.user_id) || 0) + 1);
      });

      // Sort and take top 5
      const top5 = [...countMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      if (top5.length === 0) return [];

      const userIds = top5.map(([id]) => id);
      const { data: profiles } = await db
        .from("profiles")
        .select("user_id, username, display_name, avatar_url")
        .in("user_id", userIds);

      const profilesMap = new Map<string, any>();
      (profiles || []).forEach((p: any) => profilesMap.set(p.user_id, p));

      return top5.map(([userId, count]) => {
        const profile = profilesMap.get(userId);
        return {
          user_id: userId,
          username: profile?.username || null,
          display_name: profile?.display_name || null,
          avatar_url: profile?.avatar_url || null,
          answer_count: count,
        };
      });
    },
    staleTime: 30000,
  });
}

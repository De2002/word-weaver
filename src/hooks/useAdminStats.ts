import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AdminStats {
  totalUsers: number;
  publishedPoems: number;
  approvedEvents: number;
  publishedTrails: number;
  pendingReports: number;
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async (): Promise<AdminStats> => {
      // Fetch all counts in parallel
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
    staleTime: 30000, // Cache for 30 seconds
  });
}

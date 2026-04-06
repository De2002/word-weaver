import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthProvider";
import { db } from "@/lib/db";

export type PublishTier = "observer" | "lyric" | "epic";

export function usePublishPermission() {
  const { user, roles } = useAuth();

  const isEpic = roles.includes("epic");
  const isLyric = roles.includes("lyric");
  const tier: PublishTier = isEpic ? "epic" : isLyric ? "lyric" : "observer";
  const canPublish = isLyric || isEpic;

  // Fetch monthly poem count for Lyric quota
  const { data: monthlyCount = 0 } = useQuery({
    queryKey: ["monthly-poem-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count, error } = await db
        .from("poems")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", startOfMonth.toISOString());

      if (error) return 0;
      return count ?? 0;
    },
    enabled: !!user && isLyric && !isEpic,
  });

  const monthlyLimit = isLyric && !isEpic ? 100 : Infinity;
  const remaining = Math.max(0, monthlyLimit - monthlyCount);
  const quotaReached = isLyric && !isEpic && monthlyCount >= 100;

  return {
    tier,
    canPublish,
    isLyric,
    isEpic,
    monthlyCount,
    monthlyLimit,
    remaining,
    quotaReached,
  };
}

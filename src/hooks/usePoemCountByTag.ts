import { useEffect, useState } from "react";
import { db } from "@/lib/db";

export function usePoemCountByTag() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await db
          .from("poems")
          .select("tags")
          .eq("status", "published");

        if (error) throw error;

        const tagCounts: Record<string, number> = {};
        data?.forEach((poem) => {
          if (Array.isArray(poem.tags)) {
            poem.tags.forEach((tag: string) => {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
          }
        });

        setCounts(tagCounts);
      } catch (e) {
        console.error("Failed to fetch poem counts:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, []);

  return { counts, isLoading };
}

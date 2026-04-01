import { useEffect, useState } from "react";
import { db } from "@/lib/db";

export interface AdminTag {
  id: string;
  tag: string;
  description: string | null;
  banner_url: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export function useAdminTags() {
  const [tags, setTags] = useState<AdminTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoading(true);
        const { data, error: fetchError } = await db
          .from("tag_metadata")
          .select("*")
          .order("created_at", { ascending: false });

        if (fetchError) throw fetchError;
        setTags(data || []);
      } catch (e) {
        setError(e instanceof Error ? e : new Error("Failed to fetch tags"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, []);

  return { tags, isLoading, error };
}

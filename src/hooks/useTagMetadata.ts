import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/db";

interface TagMeta {
  id: string;
  tag: string;
  description: string | null;
  banner_url: string | null;
}

export function useTagMetadata(tag: string) {
  return useQuery<TagMeta | null>({
    queryKey: ["tag-metadata", tag],
    queryFn: async () => {
      if (!tag) return null;
      const { data, error } = await db
        .from("tag_metadata")
        .select("id, tag, description, banner_url")
        .eq("tag", tag.toLowerCase())
        .maybeSingle();
      if (error) throw error;
      return data ?? null;
    },
    enabled: !!tag,
  });
}

export function useAllTagMetadata() {
  return useQuery<TagMeta[]>({
    queryKey: ["all-tag-metadata"],
    queryFn: async () => {
      const { data, error } = await db
        .from("tag_metadata")
        .select("id, tag, description, banner_url")
        .order("tag");
      if (error) throw error;
      return data ?? [];
    },
  });
}

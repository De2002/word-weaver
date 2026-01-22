import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PoemEditor } from "@/components/PoemEditor";
import { db } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthProvider";

export default function EditPoem() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState<any>(null);

  useEffect(() => {
    if (!id || !user) return;
    (async () => {
      setLoading(true);
      const { data: poem, error } = await db
        .from("poems")
        .select("id, title, content, tags, status")
        .eq("id", id)
        .maybeSingle();
      if (error) {
        setLoading(false);
        toast({ title: "Couldn’t load poem", description: error.message, variant: "destructive" });
        return;
      }

      const { data: audio } = await db
        .from("poem_audio_files")
        .select("storage_path")
        .eq("poem_id", id)
        .maybeSingle();

      if (!poem?.id) {
        setInitial(null);
        setLoading(false);
        toast({ title: "Not found", description: "Poem not found (or you don’t have access).", variant: "destructive" });
        return;
      }

      setInitial({
        id: poem.id,
        title: poem.title,
        content: poem.content,
        tags: poem.tags ?? [],
        status: poem.status,
        audioPath: audio?.storage_path ?? null,
      });
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 h-14 max-w-2xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-base font-semibold">Edit poem</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="p-4 pb-24 max-w-2xl mx-auto">
        {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : <PoemEditor initial={initial} />}
      </main>
    </div>
  );
}

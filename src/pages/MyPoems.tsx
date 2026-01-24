import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { Header } from "@/components/Header";
import { CreateButton } from "@/components/CreateButton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/db";
import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/hooks/use-toast";

type PoemRow = {
  id: string;
  title: string | null;
  content: string;
  status: "draft" | "published";
  updated_at: string;
};

export default function MyPoems() {
  const { user, isPoet } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [poems, setPoems] = useState<PoemRow[]>([]);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await db
      .from("poems")
      .select("id, title, content, status, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    setLoading(false);
    if (error) {
      toast({ title: "Couldn’t load poems", description: error.message, variant: "destructive" });
      return;
    }
    setPoems((data ?? []) as PoemRow[]);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const drafts = useMemo(() => poems.filter((p) => p.status === "draft"), [poems]);
  const published = useMemo(() => poems.filter((p) => p.status === "published"), [poems]);

  const setStatus = async (poemId: string, next: "draft" | "published") => {
    const { error } = await db.from("poems").update({ status: next }).eq("id", poemId);
    if (error) {
      toast({ title: "Couldn’t update", description: error.message, variant: "destructive" });
      return;
    }
    await load();
  };

  const remove = async (poemId: string) => {
    const { error } = await db.from("poems").delete().eq("id", poemId);
    if (error) {
      toast({ title: "Couldn’t delete", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Deleted", description: "Your poem was removed." });
    await load();
  };

  if (!isPoet) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-10 pb-24">
          <h1 className="text-xl font-semibold">My Poems</h1>
          <p className="mt-2 text-sm text-muted-foreground">Turn on Poet mode to write and manage poems.</p>
          <Button asChild className="mt-4">
            <Link to="/profile">Enable Poet mode</Link>
          </Button>
        </main>
        <CreateButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        <div className="flex items-center gap-3">
          <Link to="/home" className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-semibold">My Poems</h1>
        </div>

        <Tabs defaultValue="drafts" className="mt-5">
          <TabsList className="w-full grid grid-cols-2 bg-secondary/50">
            <TabsTrigger value="drafts" className="text-sm">Drafts</TabsTrigger>
            <TabsTrigger value="published" className="text-sm">Published</TabsTrigger>
          </TabsList>

          <TabsContent value="drafts" className="mt-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : drafts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No drafts yet.</p>
            ) : (
              <div className="space-y-3">
                {drafts.map((p, idx) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="rounded-xl border border-border bg-card p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="font-medium truncate">{p.title || "Untitled"}</h2>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.content}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button asChild size="icon" variant="outline">
                          <Link to={`/poems/${p.id}/edit`} aria-label="Edit">
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button size="icon" variant="outline" onClick={() => setStatus(p.id, "published")} aria-label="Publish">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" onClick={() => remove(p.id)} aria-label="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="published" className="mt-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : published.length === 0 ? (
              <p className="text-sm text-muted-foreground">No published poems yet.</p>
            ) : (
              <div className="space-y-3">
                {published.map((p, idx) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="rounded-xl border border-border bg-card p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="font-medium truncate">{p.title || "Untitled"}</h2>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.content}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button asChild size="icon" variant="outline">
                          <Link to={`/poems/${p.id}/edit`} aria-label="Edit">
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button size="icon" variant="outline" onClick={() => setStatus(p.id, "draft")} aria-label="Unpublish">
                          <EyeOff className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" onClick={() => remove(p.id)} aria-label="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <CreateButton />
    </div>
  );
}

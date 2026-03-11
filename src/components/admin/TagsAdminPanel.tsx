import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Upload, Hash, Loader2, X } from "lucide-react";
import { db } from "@/lib/db";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface TagMeta {
  id: string;
  tag: string;
  description: string | null;
  banner_url: string | null;
  created_at: string;
  updated_at: string;
}

interface TagForm {
  tag: string;
  description: string;
  banner_url: string;
}

const EMPTY_FORM: TagForm = { tag: "", description: "", banner_url: "" };

export function TagsAdminPanel() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TagMeta | null>(null);
  const [form, setForm] = useState<TagForm>(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);

  const { data: tags = [], isLoading } = useQuery<TagMeta[]>({
    queryKey: ["admin-tag-metadata"],
    queryFn: async () => {
      const { data, error } = await db
        .from("tag_metadata")
        .select("*")
        .order("tag");
      if (error) throw error;
      return data ?? [];
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (values: TagForm) => {
      if (editing) {
        const { error } = await db
          .from("tag_metadata")
          .update({
            description: values.description || null,
            banner_url: values.banner_url || null,
          })
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await db.from("tag_metadata").insert({
          tag: values.tag.toLowerCase().trim(),
          description: values.description || null,
          banner_url: values.banner_url || null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tag-metadata"] });
      queryClient.invalidateQueries({ queryKey: ["tag-metadata"] });
      toast.success(editing ? "Tag updated" : "Tag created");
      handleClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("tag_metadata").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tag-metadata"] });
      queryClient.invalidateQueries({ queryKey: ["tag-metadata"] });
      toast.success("Tag metadata deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleOpen = (meta?: TagMeta) => {
    if (meta) {
      setEditing(meta);
      setForm({ tag: meta.tag, description: meta.description ?? "", banner_url: meta.banner_url ?? "" });
    } else {
      setEditing(null);
      setForm(EMPTY_FORM);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("tag-banners")
        .upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage
        .from("tag-banners")
        .getPublicUrl(path);
      setForm((f) => ({ ...f, banner_url: urlData.publicUrl }));
      toast.success("Banner uploaded");
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Tag Pages</h3>
          <p className="text-sm text-muted-foreground">Manage descriptions and banner images for tag pages.</p>
        </div>
        <Button size="sm" onClick={() => handleOpen()}>
          <Plus className="h-4 w-4 mr-1" />
          Add Tag
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : tags.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Hash className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No tag metadata yet</p>
            <p className="text-sm mt-1">Add a tag to give it a description and banner image.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {tags.map((meta) => (
            <Card key={meta.id} className="overflow-hidden">
              <div className="flex items-stretch">
                {meta.banner_url ? (
                  <div
                    className="w-24 shrink-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${meta.banner_url})` }}
                  />
                ) : (
                  <div className="w-24 shrink-0 bg-secondary flex items-center justify-center">
                    <Hash className="h-5 w-5 text-muted-foreground/50" />
                  </div>
                )}
                <CardContent className="flex-1 py-3 px-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">#{meta.tag}</p>
                    {meta.description ? (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{meta.description}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground/60 italic mt-0.5">No description</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpen(meta)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteMutation.mutate(meta.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit #${editing.tag}` : "Add Tag Metadata"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {!editing && (
              <div className="space-y-1.5">
                <Label htmlFor="tag-name">Tag name</Label>
                <Input
                  id="tag-name"
                  placeholder="e.g. haiku"
                  value={form.tag}
                  onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="tag-desc">Description</Label>
              <Textarea
                id="tag-desc"
                placeholder="A brief description shown on the tag page…"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Banner image</Label>
              {form.banner_url ? (
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <img
                    src={form.banner_url}
                    alt="Banner preview"
                    className="w-full h-32 object-cover"
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 rounded-full"
                    onClick={() => setForm((f) => ({ ...f, banner_url: "" }))}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center gap-2 border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:border-primary/50 transition-colors">
                  {uploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Click to upload banner</span>
                      <span className="text-xs text-muted-foreground/60">PNG, JPG up to 5MB</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} disabled={uploading} />
                </label>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button
              onClick={() => upsertMutation.mutate(form)}
              disabled={upsertMutation.isPending || (!editing && !form.tag.trim())}
            >
              {upsertMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editing ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

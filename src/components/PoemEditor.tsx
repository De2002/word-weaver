import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Music, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { normalizeTag } from "@/lib/tags";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/db";
import { useAuth } from "@/context/AuthProvider";

const MAX_TITLE_LENGTH = 100;
const MAX_POEM_LENGTH = 5000;
const MAX_TAGS = 10;

export type PoemEditorInitial = {
  id?: string;
  title?: string | null;
  content?: string | null;
  tags?: string[] | null;
  status?: "draft" | "published";
  audioPath?: string | null;
};

type Props = {
  initial?: PoemEditorInitial;
};

export function PoemEditor({ initial }: Props) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isPoet } = useAuth();
  const audioInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [poemText, setPoemText] = useState(initial?.content ?? "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [existingAudioPath, setExistingAudioPath] = useState<string | null>(initial?.audioPath ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = Boolean(initial?.id);
  const canSubmit = poemText.trim().length > 0;
  const canWritePoems = isPoet;

  const tagCountLabel = useMemo(() => `${tags.length}/${MAX_TAGS} tags`, [tags.length]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const normalized = normalizeTag(tagInput);
      if (normalized && !tags.includes(normalized) && tags.length < MAX_TAGS) {
        setTags([...tags, normalized]);
        setTagInput("");
      } else if (tags.length >= MAX_TAGS) {
        toast({
          title: "Tag limit reached",
          description: `You can add up to ${MAX_TAGS} tags.`,
          variant: "destructive",
        });
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => setTags(tags.filter((t) => t !== tagToRemove));

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Audio file must be less than 10MB.", variant: "destructive" });
      return;
    }
    if (!file.type.startsWith("audio/")) {
      toast({ title: "Invalid file type", description: "Please upload an audio file.", variant: "destructive" });
      return;
    }

    setAudioFile(file);
  };

  const handleRemoveAudio = () => {
    setAudioFile(null);
    setExistingAudioPath(null);
    if (audioInputRef.current) audioInputRef.current.value = "";
  };

  const uploadAudioIfNeeded = async (poemId: string) => {
    if (!user) throw new Error("Not authenticated");
    if (!audioFile) return existingAudioPath;

    const safeName = audioFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${user.id}/${poemId}/${Date.now()}_${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("poem-audio")
      .upload(storagePath, audioFile, { upsert: false, contentType: audioFile.type });

    if (uploadError) throw uploadError;

    // Link it in DB
    const { error: upsertError } = await db
      .from("poem_audio_files")
      .upsert(
        {
          poem_id: poemId,
          user_id: user.id,
          storage_path: storagePath,
        },
        { onConflict: "poem_id" }
      );
    if (upsertError) throw upsertError;

    return storagePath;
  };

  const save = async (status: "draft" | "published") => {
    if (!user) {
      toast({ title: "Please sign in", description: "You need an account to create poems.", variant: "destructive" });
      navigate("/login");
      return;
    }
    if (!canWritePoems) {
      toast({ title: "Become a poet to write", description: "Enable Poet mode in your profile to publish and manage poems.", variant: "destructive" });
      navigate("/profile");
      return;
    }
    if (!poemText.trim()) {
      toast({ title: "Poem text required", description: "Please write your poem first.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      let poemId = initial?.id;

      if (!poemId) {
        const { data, error } = await db
          .from("poems")
          .insert({
            user_id: user.id,
            title: title.trim() || null,
            content: poemText,
            tags,
            status,
          })
          .select("id")
          .single();

        if (error) throw error;
        poemId = data?.id;
        if (!poemId) throw new Error("Could not create poem");
      } else {
        const { error } = await db
          .from("poems")
          .update({
            title: title.trim() || null,
            content: poemText,
            tags,
            status,
          })
          .eq("id", poemId);

        if (error) throw error;
      }

      const audioPath = await uploadAudioIfNeeded(poemId);
      setExistingAudioPath(audioPath ?? null);

      toast({
        title: status === "published" ? "Poem published" : isEdit ? "Draft saved" : "Draft created",
        description: status === "published" ? "Your poem is now visible to readers." : "You can publish anytime from My Poems.",
      });

      navigate("/my-poems");
    } catch (e: any) {
      toast({ title: "Couldn’t save", description: e?.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" disabled={!canSubmit || isSubmitting} onClick={() => save("draft")}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save draft"}
        </Button>
        <Button size="sm" disabled={!canSubmit || isSubmitting} onClick={() => save("published")}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish"}
        </Button>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm text-muted-foreground">
          Title <span className="text-xs">(optional)</span>
        </Label>
        <Input
          id="title"
          placeholder="Give your poem a title..."
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE_LENGTH))}
          className="bg-secondary/50 border-border"
        />
        <p className="text-xs text-muted-foreground text-right">{title.length}/{MAX_TITLE_LENGTH}</p>
      </div>

      {/* Poem Text */}
      <div className="space-y-2">
        <Label htmlFor="poem" className="text-sm text-muted-foreground">
          Your Poem <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="poem"
          placeholder="Write your poem here…"
          value={poemText}
          onChange={(e) => setPoemText(e.target.value.slice(0, MAX_POEM_LENGTH))}
          className="min-h-[300px] bg-secondary/50 border-border resize-none font-serif text-base leading-relaxed"
        />
        <p className="text-xs text-muted-foreground text-right">{poemText.length}/{MAX_POEM_LENGTH}</p>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags" className="text-sm text-muted-foreground">
          Tags <span className="text-xs">(press Enter to add)</span>
        </Label>
        <Input
          id="tags"
          placeholder="love, nature, life..."
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          className="bg-secondary/50 border-border"
        />
        <AnimatePresence mode="popLayout">
          {tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 pt-2"
            >
              {tags.map((tag) => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  layout
                >
                  <Badge variant="secondary" className="pl-2 pr-1 py-1 gap-1 bg-primary/10 text-primary hover:bg-primary/20">
                    #{tag}
                    <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:bg-primary/20 rounded-full p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <p className="text-xs text-muted-foreground">{tagCountLabel}</p>
      </div>

      {/* Audio Upload */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">
          Audio Reading <span className="text-xs">(optional)</span>
        </Label>
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*"
          onChange={handleAudioUpload}
          className="hidden"
          id="audio-upload"
        />

        {audioFile || existingAudioPath ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg border border-border"
          >
            <div className="p-2 rounded-full bg-primary/10">
              <Music className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {audioFile ? audioFile.name : "Audio attached"}
              </p>
              <p className="text-xs text-muted-foreground">
                {audioFile ? `${(audioFile.size / (1024 * 1024)).toFixed(2)} MB` : "Stored privately"}
              </p>
            </div>
            <button onClick={handleRemoveAudio} className="p-1.5 hover:bg-destructive/10 rounded-full transition-colors">
              <X className="h-4 w-4 text-destructive" />
            </button>
          </motion.div>
        ) : (
          <label
            htmlFor="audio-upload"
            className={cn(
              "flex flex-col items-center justify-center gap-2 p-6",
              "border-2 border-dashed border-border rounded-lg",
              "cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-colors"
            )}
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Upload your reading</p>
              <p className="text-xs text-muted-foreground">MP3, WAV, M4A up to 10MB</p>
            </div>
          </label>
        )}
      </div>
    </div>
  );
}

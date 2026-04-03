import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2, Music, Upload, X, AlignLeft, AlignCenter,
  ChevronDown, ChevronUp, Tag, Check, BookOpen, Cloud, CloudOff
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/db";
import { useAuth } from "@/context/AuthProvider";
import { TagSelector } from "@/components/TagSelector";

const MAX_TITLE_LENGTH = 100;
const MAX_POEM_LENGTH = 5000;
const AUTOSAVE_DEBOUNCE_MS = 3000;   // save 3s after last keystroke
const AUTOSAVE_INTERVAL_MS = 30000;  // also save every 30s regardless

export type PoemEditorInitial = {
  id?: string;
  title?: string | null;
  content?: string | null;
  tags?: string[] | null;
  status?: "draft" | "published";
  audioPath?: string | null;
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

type Props = {
  initial?: PoemEditorInitial;
};

export function PoemEditor({ initial }: Props) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const audioInputRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const poemRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [poemText, setPoemText] = useState(initial?.content ?? "");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [existingAudioPath, setExistingAudioPath] = useState<string | null>(initial?.audioPath ?? null);
  const [alignment, setAlignment] = useState<"left" | "center">("left");
  const [metaOpen, setMetaOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [draftPoemId, setDraftPoemId] = useState<string | null>(initial?.id ?? null);

  // track last saved content to avoid unnecessary saves
  const lastSavedRef = useRef({ title: initial?.title ?? "", content: initial?.content ?? "" });
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isEdit = Boolean(initial?.id);
  const hasPoemContent = poemText.trim().length > 0;
  const canSaveDraft = hasPoemContent;
  const canPublish = hasPoemContent && tags.length >= 1;
  const canWritePoems = true;

  // Auto-grow textareas
  const autoGrow = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, []);

  useEffect(() => { autoGrow(titleRef.current); }, [title, autoGrow]);
  useEffect(() => { autoGrow(poemRef.current); }, [poemText, autoGrow]);

  // ── Auto-save logic ────────────────────────────────────────────────────────
  const autoSave = useCallback(async () => {
    if (!user || !canWritePoems || !poemText.trim()) return;
    const isSameContent =
      lastSavedRef.current.title === title &&
      lastSavedRef.current.content === poemText;
    if (isSameContent) return;

    setSaveStatus("saving");
    try {
      let poemId = draftPoemId;
      if (!poemId) {
        const { data: slugData, error: slugError } = await db.rpc("generate_poem_slug", {
          title_input: title.trim() || "poem",
        });
        if (slugError) throw slugError;
        const { data, error } = await db
          .from("poems")
          .insert({
            user_id: user.id,
            title: title.trim() || null,
            content: poemText,
            tags,
            status: "draft",
            slug: slugData as string,
          })
          .select("id")
          .single();
        if (error) throw error;
        poemId = data?.id ?? null;
        if (poemId) setDraftPoemId(poemId);
      } else {
        const { error } = await db
          .from("poems")
          .update({
            title: title.trim() || null,
            content: poemText,
            tags,
          })
          .eq("id", poemId);
        if (error) throw error;
      }
      lastSavedRef.current = { title, content: poemText };
      setSaveStatus("saved");
      // Reset back to idle after 3s
      setTimeout(() => setSaveStatus((s) => (s === "saved" ? "idle" : s)), 3000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus((s) => (s === "error" ? "idle" : s)), 3000);
    }
  }, [user, canWritePoems, poemText, title, tags, draftPoemId]);

  // Debounce: save 3s after last keystroke
  useEffect(() => {
    if (!poemText.trim()) return;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => { autoSave(); }, AUTOSAVE_DEBOUNCE_MS);
    return () => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); };
  }, [poemText, title]);

  // Interval: also save every 30s regardless
  useEffect(() => {
    intervalTimerRef.current = setInterval(() => { autoSave(); }, AUTOSAVE_INTERVAL_MS);
    return () => { if (intervalTimerRef.current) clearInterval(intervalTimerRef.current); };
  }, [autoSave]);

  const maxTags = 2;

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
    const { error: upsertError } = await db.from("poem_audio_files").upsert(
      { poem_id: poemId, user_id: user.id, storage_path: storagePath },
      { onConflict: "poem_id" }
    );
    if (upsertError) throw upsertError;
    return storagePath;
  };

  const save = async (status: "draft" | "published") => {
    if (!user) {
      toast({ title: "Please sign in", variant: "destructive" });
      navigate("/login");
      return;
    }
    if (!hasPoemContent) {
      toast({ title: "Poem is empty", description: "Write something first.", variant: "destructive" });
      return;
    }
    if (status === "published" && tags.length < 1) {
      toast({ 
        title: "Tags required", 
        description: "Tag 1 is required before publishing. Tag 2 is optional.",
        variant: "destructive" 
      });
      return;
    }
    setIsSubmitting(true);
    try {
      let poemId = initial?.id;
      if (!poemId) {
        const { data: slugData, error: slugError } = await db.rpc("generate_poem_slug", {
          title_input: title.trim() || "poem",
        });
        if (slugError) throw slugError;
        const { data, error } = await db
          .from("poems")
          .insert({
            user_id: user.id,
            title: title.trim() || null,
            content: poemText,
            tags,
            status,
            slug: slugData as string,
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
        description:
          status === "published"
            ? "Your poem is now visible to readers."
            : "You can publish anytime from My Poems.",
      });
      navigate("/my-poems");
    } catch (e: any) {
      toast({ title: "Couldn't save", description: e?.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Floating action bar ── */}
      <div className="flex items-center justify-between gap-3 mb-8">
        {/* Alignment toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/60 border border-border">
          <button
            type="button"
            onClick={() => setAlignment("left")}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              alignment === "left" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            title="Align left"
          >
            <AlignLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setAlignment("center")}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              alignment === "center" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            title="Align center"
          >
            <AlignCenter className="h-4 w-4" />
          </button>
        </div>

        {/* Auto-save status indicator */}
        <AnimatePresence mode="wait">
          {saveStatus === "saving" && (
            <motion.span
              key="saving"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving…
            </motion.span>
          )}
          {saveStatus === "saved" && (
            <motion.span
              key="saved"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <Cloud className="h-3 w-3" />
              Saved
            </motion.span>
          )}
          {saveStatus === "error" && (
            <motion.span
              key="error"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-center gap-1.5 text-xs text-destructive/70"
            >
              <CloudOff className="h-3 w-3" />
              Not saved
            </motion.span>
          )}
        </AnimatePresence>

        {/* Character count */}
        <span className="text-xs text-muted-foreground tabular-nums ml-auto">
          {poemText.length}/{MAX_POEM_LENGTH}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            disabled={!canSaveDraft || isSubmitting}
            onClick={() => save("draft")}
            className="text-muted-foreground hover:text-foreground"
          >
            Save draft
          </Button>
          <Button
            size="sm"
            disabled={!canPublish || isSubmitting}
            onClick={() => save("published")}
            className="gap-1.5"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <BookOpen className="h-4 w-4" />
                Publish
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── Writing canvas ── */}
      <div
        className={cn(
          "flex-1 flex flex-col gap-2",
          alignment === "center" && "items-center"
        )}
      >
        {/* Title */}
        <textarea
          ref={titleRef}
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE_LENGTH))}
          placeholder="Title"
          rows={1}
          className={cn(
            "w-full bg-transparent border-none outline-none resize-none overflow-hidden",
            "font-poem text-3xl md:text-4xl font-semibold text-foreground",
            "placeholder:text-muted-foreground/40",
            "leading-tight",
            alignment === "center" && "text-center"
          )}
          onInput={(e) => autoGrow(e.currentTarget)}
        />

        {/* Title char counter — only visible when close to limit */}
        {title.length > 80 && (
          <p className={cn(
            "text-xs select-none -mt-1",
            title.length >= MAX_TITLE_LENGTH ? "text-destructive/70" : "text-muted-foreground/50",
            alignment === "center" && "text-center"
          )}>
            {title.length}/{MAX_TITLE_LENGTH}
          </p>
        )}

        {/* Subtle divider between title & poem */}
        <div className={cn("h-px bg-border/60 my-3 w-16", alignment === "center" && "self-center")} />

        {/* Poem body */}
        <textarea
          ref={poemRef}
          value={poemText}
          onChange={(e) => setPoemText(e.target.value.slice(0, MAX_POEM_LENGTH))}
          placeholder={alignment === "center"
            ? "Begin your poem…\nLet each line breathe."
            : "Write your poem here…\nPress Enter for new lines."}
          rows={12}
          className={cn(
            "w-full bg-transparent border-none outline-none resize-none overflow-hidden",
            "font-poem text-xl md:text-2xl text-foreground/90",
            "leading-loose",
            "placeholder:text-muted-foreground/30 placeholder:italic",
            alignment === "center" && "text-center"
          )}
          onInput={(e) => autoGrow(e.currentTarget)}
        />

        {/* Word & line count */}
        {poemText.length > 0 && (
          <div className={cn(
            "flex gap-3 text-xs text-muted-foreground/50 mt-1 select-none",
            alignment === "center" && "justify-center"
          )}>
            <span>{poemText.trim().split(/\s+/).filter(Boolean).length} words</span>
            <span>·</span>
            <span>{poemText.split("\n").length} lines</span>
          </div>
        )}
      </div>

      {/* ── Meta panel (tags, audio) ── */}
      <div className="mt-10 border-t border-border/60">
        <button
          type="button"
          onClick={() => setMetaOpen((v) => !v)}
          className="flex items-center gap-2 w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {metaOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          <span className="font-medium">Details</span>
          {tags.length > 0 && (
            <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {tags.length} tag{tags.length !== 1 ? "s" : ""}
            </span>
          )}
          {(audioFile || existingAudioPath) && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              Audio
            </span>
          )}
        </button>

        <AnimatePresence>
          {metaOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pb-8 space-y-6 pt-2">
                {/* Tags */}
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" />
                    Tags
                    <span className="text-xs text-muted-foreground/50 ml-1">
                      required
                    </span>
                  </Label>
                  <TagSelector
                    selectedTags={tags}
                    onTagsChange={setTags}
                    maxTags={2}
                  />
                  {tags.length < 1 && (
                    <p className="text-xs text-amber-600/70">Tag 1 is required. Tag 2 is optional.</p>
                  )}
                </div>

                {/* Audio */}
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Music className="h-3.5 w-3.5" />
                    Audio Reading
                    <span className="text-xs text-muted-foreground/60 ml-1">optional</span>
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
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-3 bg-secondary/40 rounded-lg border border-border/60"
                    >
                      <div className="p-2 rounded-full bg-primary/10">
                        <Music className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {audioFile ? audioFile.name : "Audio attached"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {audioFile ? `${(audioFile.size / (1024 * 1024)).toFixed(2)} MB` : "Stored privately"}
                        </p>
                      </div>
                      <button
                        onClick={handleRemoveAudio}
                        className="p-1.5 hover:bg-destructive/10 rounded-full transition-colors"
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </button>
                    </motion.div>
                  ) : (
                    <label
                      htmlFor="audio-upload"
                      className="flex items-center gap-3 p-3 border border-dashed border-border/60 rounded-lg cursor-pointer hover:border-primary/40 hover:bg-secondary/30 transition-colors"
                    >
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Upload your reading</p>
                        <p className="text-xs text-muted-foreground">MP3, WAV, M4A · max 10MB</p>
                      </div>
                    </label>
                  )}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}

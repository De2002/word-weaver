import { useState, useRef } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface HeaderImageUploadProps {
  userId: string;
  currentHeaderUrl?: string | null;
  onUploadComplete: (url: string | null) => void;
}

export function HeaderImageUpload({
  userId,
  currentHeaderUrl,
  onUploadComplete,
}: HeaderImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file type", description: "Please select an image file.", variant: "destructive" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please select an image under 10MB.", variant: "destructive" });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}/header.${fileExt}`;

      await supabase.storage.from("avatars").remove([filePath]);

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

      onUploadComplete(publicUrl);
      toast({ title: "Header updated", description: "Your banner photo is now live!" });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({ title: "Upload failed", description: error.message || "Please try again", variant: "destructive" });
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      // Reset input so same file can be re-selected
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onUploadComplete(null);
    toast({ title: "Header removed" });
  };

  const displayUrl = previewUrl || currentHeaderUrl;

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "relative w-full h-36 rounded-xl overflow-hidden border-2 border-dashed border-border",
          "bg-secondary/30 transition-colors group",
          !displayUrl && "flex items-center justify-center"
        )}
      >
        {displayUrl ? (
          <>
            <img
              src={displayUrl}
              alt="Profile banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors" />
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground pointer-events-none">
            <Camera className="h-7 w-7" />
            <span className="text-sm font-medium">Add banner photo</span>
            <span className="text-xs">Recommended: 1500 × 500px</span>
          </div>
        )}

        {/* Overlay controls */}
        <div className={cn(
          "absolute bottom-2 right-2 flex gap-2",
          displayUrl ? "opacity-0 group-hover:opacity-100 transition-opacity" : "opacity-100"
        )}>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-8 gap-1.5 shadow-md"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Camera className="h-3.5 w-3.5" />
            )}
            {displayUrl ? "Change" : "Upload"}
          </Button>
          {displayUrl && !uploading && (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="h-8 w-8 p-0 shadow-md"
              onClick={handleRemove}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Click anywhere to upload when empty */}
        {!displayUrl && (
          <button
            type="button"
            className="absolute inset-0 w-full h-full cursor-pointer"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            aria-label="Upload banner photo"
          />
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
}

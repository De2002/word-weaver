import { useState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl?: string | null;
  displayName?: string;
  onUploadComplete: (url: string) => void;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-16 w-16",
  md: "h-20 w-20",
  lg: "h-24 w-24",
};

export function AvatarUpload({
  userId,
  currentAvatarUrl,
  displayName = "User",
  onUploadComplete,
  size = "lg",
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const initials = displayName.slice(0, 2).toUpperCase();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    // Show preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    setUploading(true);

    try {
      // Create unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `avatar.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Delete existing avatar if any
      await supabase.storage.from("avatars").remove([filePath]);

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // Add cache-busting timestamp
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

      onUploadComplete(publicUrl);
      toast({ title: "Avatar updated", description: "Your new profile picture is now live!" });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      // Clean up object URL
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    }
  };

  const displayUrl = previewUrl || currentAvatarUrl || "";

  return (
    <div className="relative inline-block">
      <Avatar className={cn(sizeClasses[size], "ring-2 ring-border")}>
        <AvatarImage src={displayUrl} alt={displayName} />
        <AvatarFallback className="bg-secondary text-lg font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={cn(
          "absolute bottom-0 right-0 p-1.5 rounded-full",
          "bg-primary text-primary-foreground",
          "hover:bg-primary/90 transition-colors",
          "border-2 border-background",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        aria-label="Upload new avatar"
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
      </button>

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

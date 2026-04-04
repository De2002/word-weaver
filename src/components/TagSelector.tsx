import { useState, useRef, useEffect, useMemo } from "react";
import { Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";
import { addTag, normalizeTag, removeTag } from "@/lib/tags";

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
}

export function TagSelector({ selectedTags, onTagsChange, maxTags = 2 }: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: suggestedTags = [], isLoading } = useQuery({
    queryKey: ["open-tag-suggestions"],
    queryFn: async () => {
      const [metadataResult, poemsResult] = await Promise.all([
        db.from("tag_metadata").select("tag").order("tag", { ascending: true }),
        db
          .from("poems")
          .select("tags")
          .eq("status", "published")
          .not("tags", "eq", "{}"),
      ]);

      if (metadataResult.error) throw metadataResult.error;
      if (poemsResult.error) throw poemsResult.error;

      const suggestions = new Map<string, string>();

      (metadataResult.data || []).forEach((item) => {
        const normalized = normalizeTag(item.tag);
        if (normalized && !suggestions.has(normalized)) {
          suggestions.set(normalized, normalized);
        }
      });

      (poemsResult.data || []).forEach((poem) => {
        if (!Array.isArray(poem.tags)) return;

        poem.tags.forEach((tag) => {
          const normalized = normalizeTag(tag);
          if (normalized && !suggestions.has(normalized)) {
            suggestions.set(normalized, normalized);
          }
        });
      });

      return Array.from(suggestions.values()).sort((a, b) => a.localeCompare(b));
    },
  });

  const normalizedSelectedTags = useMemo(
    () => new Set(selectedTags.map((tag) => normalizeTag(tag))),
    [selectedTags]
  );

  const filteredSuggestedTags = useMemo(() => {
    const query = normalizeTag(inputValue);
    if (!query) return suggestedTags.slice(0, 12);
    return suggestedTags.filter((tag) => normalizeTag(tag).includes(query)).slice(0, 12);
  }, [suggestedTags, inputValue]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const commitTag = (rawTag: string) => {
    if (selectedTags.length >= maxTags) return;

    const normalized = normalizeTag(rawTag);
    if (!normalized) return;

    const nextTags = addTag(selectedTags, normalized);

    if (nextTags.length !== selectedTags.length) {
      onTagsChange(nextTags);
    }

    setInputValue("");
    setIsOpen(false);
  };

  const handleTagClick = (tagName: string) => {
    const normalized = normalizeTag(tagName);

    if (normalizedSelectedTags.has(normalized)) {
      onTagsChange(removeTag(selectedTags, tagName));
      return;
    }

    commitTag(tagName);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(removeTag(selectedTags, tagToRemove));
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commitTag(inputValue);
      return;
    }

    if (event.key === "Backspace" && !inputValue && selectedTags.length > 0) {
      onTagsChange(selectedTags.slice(0, -1));
    }
  };

  const placeholderText =
    selectedTags.length === 0
      ? `Add up to ${maxTags} tag${maxTags !== 1 ? "s" : ""}`
      : `${selectedTags.length}/${maxTags}`;

  const canAddMoreTags = selectedTags.length < maxTags;

  return (
    <div className="space-y-2">
      <div
        ref={dropdownRef}
        className={cn(
          "relative flex min-h-11 flex-wrap items-center gap-2 rounded-md border border-border/60 bg-secondary/30 px-3 py-2",
          !canAddMoreTags && "opacity-80"
        )}
      >
        {selectedTags.map((tag) => (
          <Badge
            key={normalizeTag(tag)}
            variant="secondary"
            className="pl-2 pr-1 py-1 gap-1 bg-primary/10 text-primary hover:bg-primary/20 cursor-default"
          >
            #{tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
            >
              <span className="sr-only">Remove tag {tag}</span>×
            </button>
          </Badge>
        ))}

        <input
          value={inputValue}
          onChange={(event) => {
            setInputValue(event.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleInputKeyDown}
          onFocus={() => setIsOpen(true)}
          disabled={!canAddMoreTags}
          placeholder={canAddMoreTags ? `${placeholderText} (press Enter)` : `Maximum ${maxTags} tags reached`}
          className="min-w-[140px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70 disabled:cursor-not-allowed"
          maxLength={40}
        />

        {isOpen && canAddMoreTags && (
          <div
            className={cn(
              "absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-md shadow-lg z-50",
              "max-h-64 overflow-y-auto"
            )}
          >
            {isLoading ? (
              <div className="p-3 text-xs text-muted-foreground text-center">Loading tag suggestions...</div>
            ) : filteredSuggestedTags.length === 0 ? (
              <div className="p-3 text-xs text-muted-foreground text-center">No matching tags yet — press Enter to create one</div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredSuggestedTags.map((tag) => {
                  const isSelected = normalizedSelectedTags.has(normalizeTag(tag));

                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagClick(tag)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between",
                        "hover:bg-secondary/60 transition-colors",
                        isSelected && "bg-primary/10"
                      )}
                    >
                      <span className="font-medium">#{tag}</span>
                      {isSelected && <Check className="h-4 w-4 text-primary ml-2 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground/80">
        Open tagging is enabled: type your own tags or pick autocomplete suggestions from community-created tags.
      </p>
    </div>
  );
}

import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAdminTags } from "@/hooks/useAdminTags";
import { addTag, normalizeTag, removeTag } from "@/lib/tags";

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
}

export function TagSelector({ selectedTags, onTagsChange, maxTags = 2 }: TagSelectorProps) {
  const { tags: adminTags, isLoading } = useAdminTags();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const normalizedSelectedTags = useMemo(
    () => new Set(selectedTags.map((tag) => normalizeTag(tag))),
    [selectedTags]
  );

  const normalizedAdminTagMap = useMemo(() => {
    const map = new Map<string, string>();
    adminTags.forEach((adminTag) => {
      const normalized = normalizeTag(adminTag.tag);
      if (normalized && !map.has(normalized)) {
        map.set(normalized, adminTag.tag);
      }
    });
    return map;
  }, [adminTags]);

  const filteredAdminTags = useMemo(() => {
    const query = normalizeTag(inputValue);
    if (!query) return adminTags;
    return adminTags.filter((adminTag) => normalizeTag(adminTag.tag).includes(query));
  }, [adminTags, inputValue]);

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

    const canonicalTag = normalizedAdminTagMap.get(normalized) ?? normalized;
    const nextTags = addTag(selectedTags, canonicalTag);

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
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className={cn(
            "w-full px-3 py-2 bg-secondary/40 border border-border/60 rounded-md",
            "flex items-center justify-between gap-2",
            "text-sm text-foreground hover:bg-secondary/60 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          <span className="text-muted-foreground">Browse existing tags</span>
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </button>

        {isOpen && (
          <div
            className={cn(
              "absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-md shadow-lg z-50",
              "max-h-64 overflow-y-auto"
            )}
          >
            {isLoading ? (
              <div className="p-3 text-xs text-muted-foreground text-center">Loading tags...</div>
            ) : filteredAdminTags.length === 0 ? (
              <div className="p-3 text-xs text-muted-foreground text-center">No matching tags</div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredAdminTags.map((adminTag) => {
                  const isSelected = normalizedSelectedTags.has(normalizeTag(adminTag.tag));

                  return (
                    <button
                      key={adminTag.id}
                      type="button"
                      onClick={() => handleTagClick(adminTag.tag)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between",
                        "hover:bg-secondary/60 transition-colors",
                        isSelected && "bg-primary/10"
                      )}
                    >
                      <div className="flex-1">
                        <span className="font-medium">#{adminTag.tag}</span>
                        {adminTag.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{adminTag.description}</p>
                        )}
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-primary ml-2 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div
        className={cn(
          "flex min-h-11 flex-wrap items-center gap-2 rounded-md border border-border/60 bg-secondary/30 px-3 py-2",
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
      </div>

      <p className="text-xs text-muted-foreground/80">
        Open tagging is enabled: add your own tag or pick from suggestions. Tags are saved case-insensitively.
      </p>
    </div>
  );
}

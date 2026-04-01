import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAdminTags } from "@/hooks/useAdminTags";

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
}

export function TagSelector({ selectedTags, onTagsChange, maxTags = 2 }: TagSelectorProps) {
  const { tags: adminTags, isLoading } = useAdminTags();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTagClick = (tagId: string, tagName: string) => {
    const isSelected = selectedTags.includes(tagName);

    if (isSelected) {
      onTagsChange(selectedTags.filter((t) => t !== tagName));
    } else if (selectedTags.length < maxTags) {
      onTagsChange([...selectedTags, tagName]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter((t) => t !== tagToRemove));
  };

  const placeholderText = selectedTags.length === 0 
    ? `Select ${maxTags} tag${maxTags !== 1 ? 's' : ''}`
    : `${selectedTags.length}/${maxTags}`;

  return (
    <div className="space-y-2">
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full px-3 py-2 bg-secondary/40 border border-border/60 rounded-md",
            "flex items-center justify-between gap-2",
            "text-sm text-foreground hover:bg-secondary/60 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          <span className="text-muted-foreground">{placeholderText}</span>
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform",
            isOpen && "rotate-180"
          )} />
        </button>

        {isOpen && (
          <div className={cn(
            "absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-md shadow-lg z-50",
            "max-h-64 overflow-y-auto"
          )}>
            {isLoading ? (
              <div className="p-3 text-xs text-muted-foreground text-center">Loading tags...</div>
            ) : adminTags.length === 0 ? (
              <div className="p-3 text-xs text-muted-foreground text-center">No tags available</div>
            ) : (
              <div className="p-2 space-y-1">
                {adminTags.map((adminTag) => (
                  <button
                    key={adminTag.id}
                    type="button"
                    onClick={() => handleTagClick(adminTag.id, adminTag.tag)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between",
                      "hover:bg-secondary/60 transition-colors",
                      selectedTags.includes(adminTag.tag) && "bg-primary/10"
                    )}
                  >
                    <div className="flex-1">
                      <span className="font-medium">#{adminTag.tag}</span>
                      {adminTag.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{adminTag.description}</p>
                      )}
                    </div>
                    {selectedTags.includes(adminTag.tag) && (
                      <Check className="h-4 w-4 text-primary ml-2 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected tags display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="pl-2 pr-1 py-1 gap-1 bg-primary/10 text-primary hover:bg-primary/20 cursor-default"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
              >
                <span className="sr-only">Remove tag {tag}</span>
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

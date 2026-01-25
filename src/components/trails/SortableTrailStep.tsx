import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SortableTrailStepProps {
  id: string;
  stepOrder: number;
  poem: {
    id: string;
    title: string | null;
    content: string;
    poet?: {
      username: string | null;
      display_name: string | null;
    };
  };
  onRemove: () => void;
  isRemoving?: boolean;
}

export function SortableTrailStep({
  id,
  stepOrder,
  poem,
  onRemove,
  isRemoving,
}: SortableTrailStepProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-card border border-border rounded-lg p-3 flex items-start gap-3 transition-all",
        isDragging && "opacity-50 shadow-lg ring-2 ring-primary/20"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-1 p-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            Step {stepOrder}
          </span>
        </div>
        <p className="font-medium text-foreground line-clamp-1">
          {poem.title || 'Untitled'}
        </p>
        <p className="text-xs text-muted-foreground">
          by {poem.poet?.display_name || poem.poet?.username || 'Unknown'}
        </p>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
          {poem.content}
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
        disabled={isRemoving}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

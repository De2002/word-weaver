import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { Search, Plus, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SortableTrailStep } from './SortableTrailStep';
import { usePoemsForCuration, useAddPoemToTrail, useRemovePoemFromTrail, useReorderTrailSteps } from '@/hooks/useTrailCuration';
import { TrailStep } from '@/types/trail';
import { cn } from '@/lib/utils';

interface TrailStepsEditorProps {
  trailId: string;
  steps: TrailStep[];
  onStepsChange?: () => void;
}

export function TrailStepsEditor({ trailId, steps, onStepsChange }: TrailStepsEditorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [localSteps, setLocalSteps] = useState<TrailStep[]>(steps);

  const { data: poems, isLoading: isPoemsLoading } = usePoemsForCuration({ search: searchQuery });
  const addPoem = useAddPoemToTrail();
  const removePoem = useRemovePoemFromTrail();
  const reorderSteps = useReorderTrailSteps();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Keep localSteps in sync with props
  if (JSON.stringify(steps.map(s => s.id)) !== JSON.stringify(localSteps.map(s => s.id))) {
    setLocalSteps(steps);
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localSteps.findIndex((s) => s.id === active.id);
      const newIndex = localSteps.findIndex((s) => s.id === over.id);

      const newSteps = arrayMove(localSteps, oldIndex, newIndex);
      setLocalSteps(newSteps);

      // Update step_order for display
      const updatedSteps = newSteps.map((step, index) => ({
        ...step,
        step_order: index + 1,
      }));
      setLocalSteps(updatedSteps);

      // Persist to database
      reorderSteps.mutate(
        { trailId, stepIds: newSteps.map((s) => s.id) },
        { onSuccess: onStepsChange }
      );
    }
  };

  const handleAddPoem = (poemId: string) => {
    addPoem.mutate(
      { trailId, poemId },
      { onSuccess: onStepsChange }
    );
  };

  const handleRemoveStep = (stepId: string) => {
    removePoem.mutate(
      { stepId, trailId },
      {
        onSuccess: () => {
          setLocalSteps((prev) => prev.filter((s) => s.id !== stepId));
          onStepsChange?.();
        },
      }
    );
  };

  const addedPoemIds = new Set(localSteps.map((s) => s.poem_id));
  const availablePoems = poems?.filter((p) => !addedPoemIds.has(p.id)) || [];

  return (
    <div className="space-y-6">
      {/* Current Steps with Drag & Drop */}
      <div>
        <Label className="text-base font-medium">Trail Steps ({localSteps.length})</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Drag to reorder poems in your trail
        </p>

        {localSteps.length === 0 ? (
          <div className="border border-dashed border-border rounded-lg p-8 text-center text-muted-foreground">
            No poems added yet. Search below to add poems.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localSteps.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {localSteps.map((step) => (
                  <SortableTrailStep
                    key={step.id}
                    id={step.id}
                    stepOrder={step.step_order}
                    poem={{
                      id: step.poem_id,
                      title: step.poem?.title || null,
                      content: step.poem?.content || '',
                      poet: step.poem?.poet,
                    }}
                    onRemove={() => handleRemoveStep(step.id)}
                    isRemoving={removePoem.isPending}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {reorderSteps.isPending && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Saving order...
          </p>
        )}
      </div>

      {/* Add Poems Section */}
      <div className="border-t border-border pt-6">
        <Label className="text-base font-medium">Add Poems</Label>
        <div className="relative mt-2 mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search poems by title or content..."
            className="pl-10"
          />
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {isPoemsLoading ? (
            <div className="text-center py-4 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mx-auto" />
            </div>
          ) : availablePoems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {searchQuery ? 'No poems found' : 'Type to search for poems'}
            </p>
          ) : (
            availablePoems.map((poem) => (
              <div
                key={poem.id}
                className="p-3 rounded-lg border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground line-clamp-1">
                      {poem.title || 'Untitled'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      by {poem.poet?.display_name || poem.poet?.username}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {poem.content}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddPoem(poem.id)}
                    disabled={addPoem.isPending}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

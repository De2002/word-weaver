import { useState } from 'react';
import { motion } from 'framer-motion';
import { Map, Plus, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useMyTrails, useCreateTrail } from '@/hooks/useTrails';
import { useAddPoemToTrail } from '@/hooks/useTrailCuration';
import { TrailCategory, TRAIL_MOODS } from '@/types/trail';
import { cn } from '@/lib/utils';

interface AddToTrailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  poemId: string;
  onComplete?: () => void;
}

export function AddToTrailModal({ open, onOpenChange, poemId, onComplete }: AddToTrailModalProps) {
  const { data: trails, isLoading } = useMyTrails();
  const createTrail = useCreateTrail();
  const addPoem = useAddPoemToTrail();

  const [mode, setMode] = useState<'select' | 'create'>('select');
  const [selectedTrailId, setSelectedTrailId] = useState<string | null>(null);
  const [addedToTrails, setAddedToTrails] = useState<string[]>([]);

  // Create new trail form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<TrailCategory>('theme');
  const [newMood, setNewMood] = useState('');

  const handleAddToExisting = async (trailId: string) => {
    if (addedToTrails.includes(trailId)) return;
    
    await addPoem.mutateAsync({ trailId, poemId });
    setAddedToTrails([...addedToTrails, trailId]);
  };

  const handleCreateAndAdd = async () => {
    if (!newTitle.trim()) return;

    const trail = await createTrail.mutateAsync({
      title: newTitle.trim(),
      category: newCategory,
      mood: newMood || undefined,
      status: 'draft',
    });

    await addPoem.mutateAsync({ trailId: trail.id, poemId });
    setAddedToTrails([...addedToTrails, trail.id]);
    setMode('select');
    setNewTitle('');
  };

  const handleDone = () => {
    onOpenChange(false);
    onComplete?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            Add to Trail
          </DialogTitle>
          <DialogDescription>
            Add this poem to a guided poetry journey
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {mode === 'select' ? (
            <>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : trails && trails.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {trails.map((trail) => {
                    const isAdded = addedToTrails.includes(trail.id);
                    return (
                      <motion.button
                        key={trail.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAddToExisting(trail.id)}
                        disabled={isAdded || addPoem.isPending}
                        className={cn(
                          "w-full text-left p-3 rounded-lg border transition-all",
                          isAdded
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">{trail.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {trail.step_count || 0} poems • {trail.status}
                            </p>
                          </div>
                          {isAdded ? (
                            <Check className="h-5 w-5 text-primary" />
                          ) : (
                            <Plus className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  You haven't created any trails yet
                </p>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setMode('create')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Trail
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Trail Title</Label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., First Love Blues"
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Category</Label>
                  <Select value={newCategory} onValueChange={(v) => setNewCategory(v as TrailCategory)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="theme">Theme</SelectItem>
                      <SelectItem value="emotion">Emotion</SelectItem>
                      <SelectItem value="challenge">Challenge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Mood</Label>
                  <Select value={newMood} onValueChange={setNewMood}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRAIL_MOODS.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setMode('select')}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCreateAndAdd}
                  disabled={!newTitle.trim() || createTrail.isPending || addPoem.isPending}
                >
                  {createTrail.isPending ? 'Creating...' : 'Create & Add'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {mode === 'select' && (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Skip
            </Button>
            <Button onClick={handleDone} disabled={addedToTrails.length === 0}>
              Done {addedToTrails.length > 0 && `(${addedToTrails.length})`}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

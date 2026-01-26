import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Map, Save, Trash2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { TrailStepsEditor } from '@/components/trails/TrailStepsEditor';
import { useTrailDetail, useTrailSteps } from '@/hooks/useTrailDetail';
import { useUpdateTrail, useDeleteTrail } from '@/hooks/useTrails';
import { TrailCategory, TrailStatus, TRAIL_MOODS } from '@/types/trail';
import { useAuth } from '@/context/AuthProvider';
import { useSEO } from '@/hooks/useSEO';

export default function EditTrail() {
  useSEO({
    title: "Edit Trail",
    description: "Edit your poetry trail on WordStack."
  });
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: trail, isLoading: isTrailLoading, refetch: refetchTrail } = useTrailDetail(id || '');
  const { data: steps, isLoading: isStepsLoading, refetch: refetchSteps } = useTrailSteps(id || '');
  const updateTrail = useUpdateTrail();
  const deleteTrail = useDeleteTrail();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TrailCategory>('theme');
  const [mood, setMood] = useState('');
  const [curationNote, setCurationNote] = useState('');
  const [status, setStatus] = useState<TrailStatus>('draft');

  useEffect(() => {
    if (trail) {
      setTitle(trail.title);
      setDescription(trail.description || '');
      setCategory(trail.category);
      setMood(trail.mood || '');
      setCurationNote(trail.curation_note || '');
      setStatus(trail.status);
    }
  }, [trail]);

  const handleSave = async () => {
    if (!id || !title.trim()) return;

    await updateTrail.mutateAsync({
      id,
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      mood: mood || undefined,
      curation_note: curationNote.trim() || undefined,
      status,
    });

    navigate(`/trails/${id}`);
  };

  const handleDelete = async () => {
    if (!id) return;
    await deleteTrail.mutateAsync(id);
    navigate('/trails');
  };

  const handleStepsChange = () => {
    refetchSteps();
    refetchTrail();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to edit trails.</p>
      </div>
    );
  }

  if (isTrailLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-2xl mx-auto px-4 pt-20">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!trail || trail.user_id !== user.id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Trail not found or you don't have permission to edit.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-2xl mx-auto px-4 pt-20 pb-24">
        <Link
          to={`/trails/${id}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Trail
        </Link>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Map className="h-6 w-6 text-primary" />
              Edit Trail
            </h1>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Trail?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete "{trail.title}" and all its steps. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="space-y-6">
            {/* Trail Details */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-4">
              <div>
                <Label htmlFor="title">Trail Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., First Love Blues"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this trail about?"
                  className="mt-1.5"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as TrailCategory)}>
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
                  <Select value={mood} onValueChange={setMood}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select mood" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRAIL_MOODS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as TrailStatus)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="curation-note">Why this trail was curated</Label>
                <Textarea
                  id="curation-note"
                  value={curationNote}
                  onChange={(e) => setCurationNote(e.target.value)}
                  placeholder="We chose these poems to..."
                  className="mt-1.5"
                  rows={2}
                />
              </div>
            </div>

            {/* Trail Steps Editor */}
            <div className="bg-card border border-border rounded-xl p-4">
              {isStepsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : (
                <TrailStepsEditor
                  trailId={id!}
                  steps={steps || []}
                  onStepsChange={handleStepsChange}
                />
              )}
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={!title.trim() || updateTrail.isPending}
              className="w-full"
              size="lg"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateTrail.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

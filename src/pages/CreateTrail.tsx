import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Map, Plus, Search, X, GripVertical } from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useCreateTrail, useUpdateTrail } from '@/hooks/useTrails';
import { usePoemsForCuration, useAddPoemToTrail, useRemovePoemFromTrail } from '@/hooks/useTrailCuration';
import { TrailCategory, TRAIL_MOODS } from '@/types/trail';
import { useAuth } from '@/context/AuthProvider';
import { cn } from '@/lib/utils';

export default function CreateTrail() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createTrail = useCreateTrail();
  const updateTrail = useUpdateTrail();
  const addPoem = useAddPoemToTrail();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TrailCategory>('theme');
  const [mood, setMood] = useState('');
  const [curationNote, setCurationNote] = useState('');
  const [createdTrailId, setCreatedTrailId] = useState<string | null>(null);
  const [selectedPoems, setSelectedPoems] = useState<string[]>([]);

  // Poem search
  const [searchQuery, setSearchQuery] = useState('');
  const { data: poems } = usePoemsForCuration({ search: searchQuery });

  const handleCreateTrail = async () => {
    if (!title.trim()) return;

    const result = await createTrail.mutateAsync({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      mood: mood || undefined,
      curation_note: curationNote.trim() || undefined,
      status: 'draft',
    });

    setCreatedTrailId(result.id);
  };

  const handleAddPoem = (poemId: string) => {
    if (!createdTrailId || selectedPoems.includes(poemId)) return;
    
    addPoem.mutate(
      { trailId: createdTrailId, poemId },
      { onSuccess: () => setSelectedPoems([...selectedPoems, poemId]) }
    );
  };

  const handlePublish = async () => {
    if (!createdTrailId || selectedPoems.length === 0) return;
    
    await updateTrail.mutateAsync({ id: createdTrailId, status: 'published' });
    navigate('/trails');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to create trails.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <Link to="/trails" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Trails
        </Link>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <Map className="h-6 w-6 text-primary" />
            {createdTrailId ? 'Add Poems to Trail' : 'Create New Trail'}
          </h1>

          {!createdTrailId ? (
            <div className="space-y-6">
              <div>
                <Label htmlFor="title">Trail Title *</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., First Love Blues" className="mt-1.5" />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's this trail about?" className="mt-1.5" rows={3} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category *</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as TrailCategory)}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
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
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select mood" /></SelectTrigger>
                    <SelectContent>
                      {TRAIL_MOODS.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="curation-note">Why this trail was curated</Label>
                <Textarea id="curation-note" value={curationNote} onChange={(e) => setCurationNote(e.target.value)} placeholder="We chose these poems to..." className="mt-1.5" rows={2} />
              </div>

              <Button onClick={handleCreateTrail} disabled={!title.trim() || createTrail.isPending} className="w-full" size="lg">
                {createTrail.isPending ? 'Creating...' : 'Create Trail & Add Poems'}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-sm text-muted-foreground mb-1">Trail created</p>
                <p className="font-medium text-foreground">{title}</p>
                <Badge className="mt-2">{selectedPoems.length} poems added</Badge>
              </div>

              <div>
                <Label>Search poems to add</Label>
                <div className="relative mt-1.5">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by title or content..." className="pl-10" />
                </div>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {poems?.map((poem) => {
                  const isAdded = selectedPoems.includes(poem.id);
                  return (
                    <div key={poem.id} className={cn("p-3 rounded-lg border transition-all", isAdded ? "border-primary/30 bg-primary/5" : "border-border hover:border-primary/20")}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground line-clamp-1">{poem.title || 'Untitled'}</p>
                          <p className="text-xs text-muted-foreground">by {poem.poet?.display_name || poem.poet?.username}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{poem.content}</p>
                        </div>
                        <Button size="sm" variant={isAdded ? "secondary" : "outline"} onClick={() => handleAddPoem(poem.id)} disabled={isAdded || addPoem.isPending}>
                          {isAdded ? 'Added' : <><Plus className="h-3 w-3 mr-1" />Add</>}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button onClick={handlePublish} disabled={selectedPoems.length === 0 || updateTrail.isPending} className="w-full" size="lg">
                {updateTrail.isPending ? 'Publishing...' : `Publish Trail (${selectedPoems.length} poems)`}
              </Button>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

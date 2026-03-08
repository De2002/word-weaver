import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, BookOpen, User2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClassicPoets, useClassicPoetPoems } from '@/hooks/useClassics';
import {
  useCreateClassicPoet, useUpdateClassicPoet, useDeleteClassicPoet,
  useCreateClassicPoem, useUpdateClassicPoem, useDeleteClassicPoem,
} from '@/hooks/useClassicsAdmin';
import { db } from '@/lib/db';
import type { ClassicPoet, ClassicPoem } from '@/types/classic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ── Schemas ────────────────────────────────────────────────────────────────

const poetSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'lowercase letters, numbers and hyphens only'),
  bio: z.string().optional(),
  about: z.string().optional(),
  born_year: z.coerce.number().optional().nullable(),
  died_year: z.coerce.number().optional().nullable(),
  nationality: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  featured: z.boolean().default(false),
});

const poemSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'lowercase letters, numbers and hyphens only'),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  tags: z.string().optional(),
  published_year: z.coerce.number().optional().nullable(),
  source: z.string().optional(),
  featured: z.boolean().default(false),
  status: z.enum(['published', 'draft']).default('published'),
});

type PoetFormData = z.infer<typeof poetSchema>;
type PoemFormData = z.infer<typeof poemSchema>;

// ── Slug helper ────────────────────────────────────────────────────────────

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ── Poet Form ──────────────────────────────────────────────────────────────

function PoetForm({
  initial,
  onClose,
}: {
  initial?: ClassicPoet;
  onClose: () => void;
}) {
  const create = useCreateClassicPoet();
  const update = useUpdateClassicPoet();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PoetFormData>({
    resolver: zodResolver(poetSchema),
    defaultValues: initial
      ? {
          ...initial,
          bio: initial.bio ?? '',
          about: initial.about ?? '',
          nationality: initial.nationality ?? '',
          image_url: initial.image_url ?? '',
          born_year: initial.born_year ?? undefined,
          died_year: initial.died_year ?? undefined,
        }
      : { featured: false, status: 'published' } as any,
  });

  const nameVal = watch('name');

  const onSubmit = async (data: PoetFormData) => {
    const payload = {
      ...data,
      bio: data.bio || null,
      about: data.about || null,
      nationality: data.nationality || null,
      image_url: data.image_url || null,
      born_year: data.born_year ?? null,
      died_year: data.died_year ?? null,
    };
    if (initial) {
      await update.mutateAsync({ id: initial.id, ...payload });
    } else {
      await create.mutateAsync(payload as any);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Name *</Label>
          <Input
            {...register('name')}
            placeholder="Edgar Allan Poe"
            onChange={(e) => {
              register('name').onChange(e);
              if (!initial) setValue('slug', toSlug(e.target.value));
            }}
          />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
        </div>
        <div className="col-span-2">
          <Label>Slug *</Label>
          <Input {...register('slug')} placeholder="edgar-allan-poe" />
          {errors.slug && <p className="text-xs text-destructive mt-1">{errors.slug.message}</p>}
        </div>
        <div>
          <Label>Nationality</Label>
          <Input {...register('nationality')} placeholder="American" />
        </div>
        <div>
          <Label>Image URL</Label>
          <Input {...register('image_url')} placeholder="https://…" />
          {errors.image_url && <p className="text-xs text-destructive mt-1">{errors.image_url.message}</p>}
        </div>
        <div>
          <Label>Born Year</Label>
          <Input {...register('born_year')} type="number" placeholder="1809" />
        </div>
        <div>
          <Label>Died Year</Label>
          <Input {...register('died_year')} type="number" placeholder="1849" />
        </div>
        <div className="col-span-2">
          <Label>Short Bio</Label>
          <Input {...register('bio')} placeholder="One-line bio shown on cards" />
        </div>
        <div className="col-span-2">
          <Label>Full About</Label>
          <Textarea {...register('about')} rows={4} placeholder="Full biography shown on the poet page…" />
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <input type="checkbox" id="poet-featured" {...register('featured')} className="h-4 w-4" />
          <Label htmlFor="poet-featured">Featured poet (shown on Classics home)</Label>
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {initial ? 'Save Changes' : 'Add Poet'}
        </Button>
      </div>
    </form>
  );
}

// ── Poem Form ──────────────────────────────────────────────────────────────

function PoemForm({
  poetId,
  initial,
  onClose,
}: {
  poetId: string;
  initial?: ClassicPoem;
  onClose: () => void;
}) {
  const create = useCreateClassicPoem();
  const update = useUpdateClassicPoem();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PoemFormData>({
    resolver: zodResolver(poemSchema),
    defaultValues: initial
      ? {
          ...initial,
          tags: initial.tags.join(', '),
          excerpt: initial.excerpt ?? '',
          source: initial.source ?? '',
          published_year: initial.published_year ?? undefined,
        }
      : { featured: false, status: 'published' },
  });

  const onSubmit = async (data: PoemFormData) => {
    const tags = data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
    const payload = {
      ...data,
      poet_id: poetId,
      tags,
      excerpt: data.excerpt || null,
      source: data.source || null,
      published_year: data.published_year ?? null,
    };
    if (initial) {
      await update.mutateAsync({ id: initial.id, ...payload });
    } else {
      await create.mutateAsync(payload as any);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Title *</Label>
          <Input
            {...register('title')}
            placeholder="The Raven"
            onChange={(e) => {
              register('title').onChange(e);
              if (!initial) setValue('slug', toSlug(e.target.value));
            }}
          />
          {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
        </div>
        <div className="col-span-2">
          <Label>Slug *</Label>
          <Input {...register('slug')} placeholder="the-raven" />
          {errors.slug && <p className="text-xs text-destructive mt-1">{errors.slug.message}</p>}
        </div>
        <div className="col-span-2">
          <Label>Content *</Label>
          <Textarea
            {...register('content')}
            rows={10}
            placeholder="Once upon a midnight dreary…&#10;While I pondered, weak and weary…"
            className="font-mono text-sm"
          />
          {errors.content && <p className="text-xs text-destructive mt-1">{errors.content.message}</p>}
        </div>
        <div className="col-span-2">
          <Label>Excerpt (first lines preview)</Label>
          <Input {...register('excerpt')} placeholder="Once upon a midnight dreary, while I pondered, weak and weary…" />
        </div>
        <div>
          <Label>Published Year</Label>
          <Input {...register('published_year')} type="number" placeholder="1845" />
        </div>
        <div>
          <Label>Source</Label>
          <Input {...register('source')} placeholder="Graham's Magazine, 1845" />
        </div>
        <div className="col-span-2">
          <Label>Tags (comma-separated)</Label>
          <Input {...register('tags')} placeholder="gothic, melancholy, loss" />
        </div>
        <div>
          <Label>Status</Label>
          <select
            {...register('status')}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div className="flex items-center gap-2 self-end pb-2">
          <input type="checkbox" id="poem-featured" {...register('featured')} className="h-4 w-4" />
          <Label htmlFor="poem-featured">Featured poem</Label>
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {initial ? 'Save Changes' : 'Add Poem'}
        </Button>
      </div>
    </form>
  );
}

// ── Poet Row (expandable) ──────────────────────────────────────────────────

function PoetRow({ poet }: { poet: ClassicPoet }) {
  const [open, setOpen] = useState(false);
  const [editPoet, setEditPoet] = useState(false);
  const [addPoem, setAddPoem] = useState(false);
  const [editPoem, setEditPoem] = useState<ClassicPoem | null>(null);
  const deletePoet = useDeleteClassicPoet();
  const deletePoem = useDeleteClassicPoem();
  const { data: poems, isLoading } = useClassicPoetPoems(open ? poet.id : '');

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-3 p-4 bg-card cursor-pointer hover:bg-secondary transition"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="h-9 w-9 rounded-full bg-muted overflow-hidden border border-border shrink-0">
          {poet.image_url ? (
            <img src={poet.image_url} alt={poet.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <User2 className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{poet.name}</p>
          <p className="text-xs text-muted-foreground">
            {[poet.nationality, poet.born_year ? `${poet.born_year}${poet.died_year ? `–${poet.died_year}` : ''}` : null].filter(Boolean).join(' · ')}
          </p>
        </div>
        {poet.featured && <Badge variant="secondary" className="text-[10px] shrink-0">Featured</Badge>}
        <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setEditPoet(true)}
            className="p-1.5 rounded-md hover:bg-muted transition text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete ${poet.name}? This will also delete all their poems.`)) {
                deletePoet.mutate(poet.id);
              }
            }}
            className="p-1.5 rounded-md hover:bg-destructive/10 transition text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </div>

      <AnimatePresence>
        {editPoet && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border bg-muted/30"
          >
            <div className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Edit Poet</p>
              <PoetForm initial={poet} onClose={() => setEditPoet(false)} />
            </div>
          </motion.div>
        )}
        {open && !editPoet && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border bg-muted/20"
          >
            <div className="p-4 space-y-3">
              {/* Add Poem */}
              {addPoem ? (
                <div className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Add Poem</p>
                    <button onClick={() => setAddPoem(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
                  </div>
                  <PoemForm poetId={poet.id} onClose={() => setAddPoem(false)} />
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setAddPoem(true)} className="w-full">
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Poem
                </Button>
              )}

              {/* Edit Poem */}
              {editPoem && (
                <div className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Edit: {editPoem.title}</p>
                    <button onClick={() => setEditPoem(null)}><X className="h-4 w-4 text-muted-foreground" /></button>
                  </div>
                  <PoemForm poetId={poet.id} initial={editPoem} onClose={() => setEditPoem(null)} />
                </div>
              )}

              {/* Poems list */}
              {isLoading ? (
                <p className="text-xs text-muted-foreground text-center py-4">Loading poems…</p>
              ) : poems && poems.length > 0 ? (
                <div className="space-y-1.5">
                  {poems.map((poem) => (
                    <div
                      key={poem.id}
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-card border border-border"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{poem.title}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {poem.published_year ?? '—'}
                          {poem.status === 'draft' && <span className="ml-1 text-amber-500">draft</span>}
                        </p>
                      </div>
                      <button
                        onClick={() => setEditPoem(poem)}
                        className="p-1 rounded hover:bg-muted transition text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${poem.title}"?`)) deletePoem.mutate(poem.id);
                        }}
                        className="p-1 rounded hover:bg-destructive/10 transition text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-3">No poems yet.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export function ClassicsAdminPanel() {
  const [addingPoet, setAddingPoet] = useState(false);
  const { data: poets, isLoading } = useClassicPoets();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Classic Poetry Library</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{poets?.length ?? 0} poets · manage poets and their poems</p>
        </div>
        <Button size="sm" onClick={() => setAddingPoet(true)} disabled={addingPoet}>
          <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Poet
        </Button>
      </div>

      <AnimatePresence>
        {addingPoet && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">New Poet</p>
                <button onClick={() => setAddingPoet(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
              </div>
              <PoetForm onClose={() => setAddingPoet(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Loading…</p>
      ) : poets && poets.length > 0 ? (
        <div className="space-y-2">
          {poets.map((poet) => (
            <PoetRow key={poet.id} poet={poet} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-sm text-muted-foreground">No classic poets yet. Add your first poet above.</p>
        </div>
      )}
    </div>
  );
}

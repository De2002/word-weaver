import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User2, BookOpen, ChevronRight, CalendarDays, Globe, Feather } from 'lucide-react';
import { Header } from '@/components/Header';
import { CreateButton } from '@/components/CreateButton';
import { useSEO } from '@/hooks/useSEO';
import { useClassicPoet, useClassicPoetPoems } from '@/hooks/useClassics';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function ClassicPoetDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: poet, isLoading: poetLoading } = useClassicPoet(slug ?? '');
  const { data: poems, isLoading: poemsLoading } = useClassicPoetPoems(poet?.id ?? '');

  useSEO({
    title: poet ? `${poet.name} — Classic Poems` : 'Classic Poet',
    description: poet
      ? `Read the complete poems of ${poet.name}${poet.nationality ? `, ${poet.nationality} poet` : ''}${poet.born_year ? ` (${poet.born_year}${poet.died_year ? `–${poet.died_year}` : ''})` : ''}. ${poet.bio ?? ''}`
      : 'Classic poet on WordStack Classics.',
  });

  if (poetLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-3xl mx-auto px-4 pt-20 pb-28">
          <Skeleton className="h-40 rounded-xl mt-4 mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        </main>
      </div>
    );
  }

  if (!poet) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-3xl mx-auto px-4 pt-24 pb-28 text-center">
          <Feather className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-40" />
          <h1 className="text-lg font-semibold text-foreground">Poet not found</h1>
          <Link to="/classics" className="text-sm text-primary hover:underline mt-2 inline-block">
            Back to Classics
          </Link>
        </main>
      </div>
    );
  }

  const lifespan = poet.born_year && poet.died_year
    ? `${poet.born_year}–${poet.died_year}`
    : poet.born_year
    ? `b. ${poet.born_year}`
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-3xl mx-auto px-4 pt-20 pb-28">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 mb-6 pt-4 text-xs text-muted-foreground">
          <Link to="/classics" className="hover:text-foreground transition">Classics</Link>
          <span>/</span>
          <Link to="/classics/poets" className="hover:text-foreground transition">Poets</Link>
          <span>/</span>
          <span className="text-foreground truncate">{poet.name}</span>
        </div>

        {/* Poet Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-5 mb-8 p-5 rounded-2xl border border-border bg-card"
        >
          <div className="h-20 w-20 rounded-full bg-muted overflow-hidden border-2 border-border shrink-0">
            {poet.image_url ? (
              <img src={poet.image_url} alt={poet.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <User2 className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground font-poem">{poet.name}</h1>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
              {poet.nationality && (
                <span className="flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" /> {poet.nationality}
                </span>
              )}
              {lifespan && (
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" /> {lifespan}
                </span>
              )}
              {poems && (
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" /> {poems.length} poem{poems.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            {poet.bio && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{poet.bio}</p>
            )}
          </div>
        </motion.div>

        {/* About */}
        {poet.about && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-8 prose prose-sm max-w-none text-foreground"
          >
            <h2 className="text-base font-semibold text-foreground mb-3">About {poet.name}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{poet.about}</p>
          </motion.div>
        )}

        {/* Poems List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Poems ({poemsLoading ? '…' : poems?.length ?? 0})
          </h2>
          {poemsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : poems && poems.length > 0 ? (
            <div className="space-y-2">
              {poems.map((poem, i) => (
                <motion.div
                  key={poem.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.16 + i * 0.04 }}
                >
                  <Link
                    to={`/classics/poem/${poem.slug}`}
                    className="flex items-start justify-between gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary hover:border-primary/20 hover:shadow-sm transition group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition truncate">
                        {poem.title}
                      </p>
                      {poem.published_year && (
                        <p className="text-xs text-muted-foreground mt-0.5">{poem.published_year}</p>
                      )}
                      {poem.excerpt && (
                        <p className="text-xs text-muted-foreground italic mt-1 line-clamp-1">{poem.excerpt}</p>
                      )}
                      {poem.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {poem.tags.slice(0, 4).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 group-hover:text-primary transition" />
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border border-dashed border-border rounded-xl">
              <p className="text-sm text-muted-foreground">No poems added yet for this poet.</p>
            </div>
          )}
        </motion.div>
      </main>
      <CreateButton />
    </div>
  );
}

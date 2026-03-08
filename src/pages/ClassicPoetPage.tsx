import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, User2, ChevronRight, Feather } from 'lucide-react';
import { Header } from '@/components/Header';
import { CreateButton } from '@/components/CreateButton';
import { useSEO } from '@/hooks/useSEO';
import { useClassicPoets } from '@/hooks/useClassics';
import { Skeleton } from '@/components/ui/skeleton';

export default function ClassicPoetsList() {
  useSEO({
    title: 'Classic Poets',
    description:
      'Browse the complete library of classic poets on WordStack — from Homer to T.S. Eliot. Read their biography and explore their greatest poems.',
  });

  const [query, setQuery] = useState('');
  const { data: poets, isLoading } = useClassicPoets();

  const filtered = poets?.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    (p.nationality ?? '').toLowerCase().includes(query.toLowerCase())
  ) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-3xl mx-auto px-4 pt-20 pb-28">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 pt-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <Link to="/classics" className="text-xs text-muted-foreground hover:text-foreground transition">
              Classics
            </Link>
            <span className="text-muted-foreground text-xs">/</span>
            <span className="text-xs text-foreground">Poets</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground font-poem">Classic Poets</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {poets?.length ?? 0} poets in the library
          </p>
        </motion.div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by name or nationality…"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-2">
            {filtered.map((poet, i) => (
              <motion.div
                key={poet.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  to={`/classics/poet/${poet.slug}`}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary hover:border-primary/20 hover:shadow-sm transition group"
                >
                  <div className="h-12 w-12 rounded-full bg-muted overflow-hidden border border-border shrink-0">
                    {poet.image_url ? (
                      <img src={poet.image_url} alt={poet.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <User2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground group-hover:text-primary transition truncate">
                      {poet.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {[poet.nationality, poet.born_year && poet.died_year ? `${poet.born_year}–${poet.died_year}` : poet.born_year ? `b. ${poet.born_year}` : null]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                    {poet.bio && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{poet.bio}</p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition shrink-0" />
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Feather className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm text-muted-foreground">
              {query ? `No poets matching "${query}"` : 'No poets in the library yet.'}
            </p>
          </div>
        )}
      </main>
      <CreateButton />
    </div>
  );
}

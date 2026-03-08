import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Shuffle, BookOpen, ChevronRight, User2, Feather } from 'lucide-react';
import { Header } from '@/components/Header';
import { CreateButton } from '@/components/CreateButton';
import { useSEO } from '@/hooks/useSEO';
import {
  useSearchClassics,
  useFeaturedClassicPoets,
  useRecentClassicPoems,
  useClassicPoets,
} from '@/hooks/useClassics';
import { db } from '@/lib/db';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function Classics() {
  useSEO({
    title: 'Classic Poetry Library',
    description:
      'Explore the greatest poems in the English language. Search, discover, and read classic poetry from Shakespeare, Keats, Dickinson, Frost, and hundreds more.',
  });

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [randomLoading, setRandomLoading] = useState(false);

  const { data: searchResults } = useSearchClassics(searchQuery);
  const { data: featuredPoets, isLoading: poetsLoading } = useFeaturedClassicPoets(6);
  const { data: recentPoems, isLoading: recentLoading } = useRecentClassicPoems(8);
  const { data: allPoets } = useClassicPoets();

  const handleRandom = async () => {
    setRandomLoading(true);
    try {
      const { data } = await db
        .from('classic_poems')
        .select('slug')
        .eq('status', 'published')
        .limit(200);
      if (data?.length) {
        const pick = data[Math.floor(Math.random() * data.length)];
        navigate(`/classics/poem/${pick.slug}`);
      }
    } finally {
      setRandomLoading(false);
    }
  };

  const showSearch = searchQuery.trim().length >= 2;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-3xl mx-auto px-4 pt-20 pb-28">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center pt-4"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Feather className="h-6 w-6 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Classic Poetry Library
            </span>
          </div>
          <h1 className="text-3xl font-bold text-foreground font-poem leading-tight mb-2">
            The Canon, Curated
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Centuries of verse at your fingertips — from Shakespeare to Dickinson,
            Keats to Whitman.
          </p>
        </motion.div>

        {/* Search + Random */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mb-8 flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search poems, poets, tags…"
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <button
            onClick={handleRandom}
            disabled={randomLoading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition disabled:opacity-60 shrink-0"
          >
            <Shuffle className={cn('h-4 w-4', randomLoading && 'animate-spin')} />
            Random
          </button>
        </motion.div>

        {/* Search Results */}
        {showSearch && searchResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-10 space-y-6"
          >
            {searchResults.poems.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Poems ({searchResults.poems.length})
                </h2>
                <div className="space-y-2">
                  {searchResults.poems.map((poem: any) => (
                    <Link
                      key={poem.id}
                      to={`/classics/poem/${poem.slug}`}
                      className="flex items-start justify-between p-3 rounded-lg border border-border bg-card hover:bg-secondary transition group"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition">
                          {poem.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {poem.poet?.name}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {searchResults.poets.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Poets ({searchResults.poets.length})
                </h2>
                <div className="space-y-2">
                  {searchResults.poets.map((poet: any) => (
                    <Link
                      key={poet.id}
                      to={`/classics/poet/${poet.slug}`}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-secondary transition group"
                    >
                      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                        {poet.image_url ? (
                          <img src={poet.image_url} alt={poet.name} className="h-full w-full object-cover" />
                        ) : (
                          <User2 className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition truncate">
                          {poet.name}
                        </p>
                        {poet.nationality && (
                          <p className="text-xs text-muted-foreground">{poet.nationality}</p>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {searchResults.poems.length === 0 && searchResults.poets.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                No results for "{searchQuery}"
              </p>
            )}
          </motion.div>
        )}

        {/* Featured Poets */}
        {!showSearch && (
          <>
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mb-10"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Featured Poets
                </h2>
                <Link
                  to="/classics/poets"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  All poets <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              {poetsLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 rounded-xl" />
                  ))}
                </div>
              ) : featuredPoets && featuredPoets.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {featuredPoets.map((poet) => (
                    <Link
                      key={poet.id}
                      to={`/classics/poet/${poet.slug}`}
                      className="group flex flex-col items-center text-center p-4 rounded-xl border border-border bg-card hover:bg-secondary hover:border-primary/20 hover:shadow-sm transition"
                    >
                      <div className="h-14 w-14 rounded-full bg-muted overflow-hidden mb-3 border-2 border-border group-hover:border-primary/30 transition">
                        {poet.image_url ? (
                          <img
                            src={poet.image_url}
                            alt={poet.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <User2 className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium text-foreground leading-tight group-hover:text-primary transition">
                        {poet.name}
                      </p>
                      {poet.nationality && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">{poet.nationality}</p>
                      )}
                      {typeof poet.poem_count === 'number' && (
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {poet.poem_count} poem{poet.poem_count !== 1 ? 's' : ''}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyLibraryHint section="poets" />
              )}
            </motion.section>

            {/* Browse All Poets CTA */}
            {allPoets && allPoets.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.18 }}
                className="mb-10"
              >
                <Link
                  to="/classics/poets"
                  className="flex items-center justify-between w-full p-4 rounded-xl border border-border bg-card hover:bg-secondary transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Browse All Poets</p>
                      <p className="text-xs text-muted-foreground">{allPoets.length} poets in the library</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition" />
                </Link>
              </motion.div>
            )}

            {/* Recent Additions */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Recent Additions
              </h2>
              {recentLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                  ))}
                </div>
              ) : recentPoems && recentPoems.length > 0 ? (
                <div className="space-y-2">
                  {recentPoems.map((poem, i) => (
                    <motion.div
                      key={poem.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.22 + i * 0.04 }}
                    >
                      <Link
                        to={`/classics/poem/${poem.slug}`}
                        className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary hover:border-primary/20 hover:shadow-sm transition group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition truncate">
                            {poem.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {poem.poet?.name}
                            {poem.published_year ? ` · ${poem.published_year}` : ''}
                          </p>
                          {poem.excerpt && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 italic">
                              {poem.excerpt}
                            </p>
                          )}
                          {poem.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {poem.tags.slice(0, 3).map((tag) => (
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
                <EmptyLibraryHint section="poems" />
              )}
            </motion.section>
          </>
        )}
      </main>
      <CreateButton />
    </div>
  );
}

function EmptyLibraryHint({ section }: { section: 'poets' | 'poems' }) {
  return (
    <div className="text-center py-12 border border-dashed border-border rounded-xl">
      <Feather className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-40" />
      <p className="text-sm text-muted-foreground">
        No classic {section} yet.
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        Admins can add {section} from the admin dashboard.
      </p>
    </div>
  );
}

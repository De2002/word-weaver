import { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { CreateButton } from '@/components/CreateButton';
import { FeedTabs } from '@/components/FeedTabs';
import { PoemCard } from '@/components/PoemCard';
import { DiscoverSection } from '@/components/DiscoverSection';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePublishedPoems } from '@/hooks/usePublishedPoems';
import { trendingPoets, newPoets, risingPoets, mockPoets } from '@/data/mockData';

function PoemCardSkeleton() {
  return (
    <div className="bg-card rounded-xl p-4 space-y-3 border">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-5 w-3/4" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

const Index = () => {
  const { poems, isLoading, isLoadingMore, error, hasMore, loadMore, refresh } = usePublishedPoems();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Infinite scroll observer
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoadingMore && !isLoading) {
        loadMore();
      }
    },
    [hasMore, isLoadingMore, isLoading, loadMore]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px',
      threshold: 0,
    });

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-2xl mx-auto pb-safe">
        {/* Feed Tabs */}
        <FeedTabs />

        {/* Discover Sections */}
        <div className="space-y-6 py-4">
          <DiscoverSection 
            title="Trending Poets" 
            subtitle="Most loved this week"
            poets={trendingPoets.length > 0 ? trendingPoets : mockPoets.slice(0, 3)}
            type="trending"
          />
          
          <DiscoverSection 
            title="New Voices" 
            subtitle="Fresh talent to discover"
            poets={newPoets.length > 0 ? newPoets : mockPoets.slice(2, 4)}
            type="new"
          />

          {risingPoets.length > 0 && (
            <DiscoverSection 
              title="Rising Poets" 
              subtitle="Gaining momentum"
              poets={risingPoets}
              type="rising"
            />
          )}
        </div>

        {/* Divider */}
        <div className="px-4 py-4">
          <div className="h-px bg-border" />
        </div>

        {/* Poem Feed */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="px-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Latest Poems
            </h2>
            {!isLoading && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={refresh}
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4">
              <PoemCardSkeleton />
              <PoemCardSkeleton />
              <PoemCardSkeleton />
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mb-4" />
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={refresh} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && poems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-lg font-medium text-foreground mb-2">No poems yet</p>
              <p className="text-muted-foreground mb-4">Be the first to share your poetry!</p>
              <Button asChild variant="default">
                <a href="/create">Write a Poem</a>
              </Button>
            </div>
          )}

          {/* Poems List */}
          {!isLoading && !error && poems.length > 0 && (
            <div className="space-y-4">
              {poems.map((poem, index) => (
                <PoemCard key={poem.id} poem={poem} index={index} />
              ))}
            </div>
          )}
        </motion.section>

        {/* Load More / Infinite Scroll Trigger */}
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {isLoadingMore && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading more...</span>
            </div>
          )}
          {!isLoadingMore && hasMore && poems.length > 0 && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-sm text-muted-foreground"
            >
              Scroll for more poetry...
            </motion.div>
          )}
          {!hasMore && poems.length > 0 && (
            <p className="text-sm text-muted-foreground">You've reached the end ✨</p>
          )}
        </div>
      </main>

      <CreateButton />
      <BottomNav />
    </div>
  );
};

export default Index;

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader2, RefreshCw, AlertCircle, Users, Star } from 'lucide-react';
import { Header } from '@/components/Header';
import { CreateButton } from '@/components/CreateButton';
import { PoemCard } from '@/components/PoemCard';
import { DiscoverSection } from '@/components/DiscoverSection';
import { PullToRefreshIndicator } from '@/components/PullToRefreshIndicator';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePublishedPoems } from '@/hooks/usePublishedPoems';
import { useFollowingPoems } from '@/hooks/useFollowingPoems';
import { useTopLikedPoems } from '@/hooks/useTopLikedPoems';
import { useDiscoverPoets } from '@/hooks/useDiscoverPoets';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useSEO } from '@/hooks/useSEO';

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
  useSEO({
    title: "Read, Write Poems, Listen & Join Events",
    description: "Join Wordstack — a poetry community where you can read poems, publish your own poetry, listen to spoken word, and take part in poetry events with writers around the world."
  });

  const [activeTab, setActiveTab] = useState('for-you');

  // For You = top liked poems across all poets
  const { poems: topLikedPoems, isLoading: topLikedLoading, isLoadingMore: topLikedLoadingMore, error: topLikedError, hasMore: topLikedHasMore, loadMore: loadMoreTopLiked, refresh: refreshTopLiked } = useTopLikedPoems();
  // Recent = all published poems
  const { poems, isLoading, isLoadingMore, error, hasMore, loadMore, refresh } = usePublishedPoems();
  // Following
  const { poems: followingPoems, isLoading: followingLoading, error: followingError, hasMore: followingHasMore, loadMore: loadMoreFollowing, refresh: refreshFollowing, isAuthenticated } = useFollowingPoems();

  const { risingPoets, newPoets, isLoading: poetsLoading } = useDiscoverPoets();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Determine which data to show based on active tab
  const getCurrentData = useCallback(() => {
    switch (activeTab) {
      case 'recent':
        return { poems, loading: isLoading, loadingMore: isLoadingMore, error, hasMore, loadMore, refresh };
      case 'following':
        return { poems: followingPoems, loading: followingLoading, loadingMore: false, error: followingError, hasMore: followingHasMore, loadMore: loadMoreFollowing, refresh: refreshFollowing };
      default: // for-you
        return { poems: topLikedPoems, loading: topLikedLoading, loadingMore: topLikedLoadingMore, error: topLikedError, hasMore: topLikedHasMore, loadMore: loadMoreTopLiked, refresh: refreshTopLiked };
    }
  }, [activeTab, poems, isLoading, isLoadingMore, error, hasMore, loadMore, refresh, followingPoems, followingLoading, followingError, followingHasMore, loadMoreFollowing, refreshFollowing, topLikedPoems, topLikedLoading, topLikedLoadingMore, topLikedError, topLikedHasMore, loadMoreTopLiked, refreshTopLiked]);

  const currentData = getCurrentData();

  // Pull to refresh
  const handlePullRefresh = useCallback(async () => {
    await currentData.refresh();
  }, [currentData]);

  const { containerRef, pullDistance, isRefreshing, progress } = usePullToRefresh({
    onRefresh: handlePullRefresh,
    threshold: 80,
  });

  // Infinite scroll observer
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && currentData.hasMore && !currentData.loadingMore && !currentData.loading) {
        currentData.loadMore();
      }
    },
    [currentData]
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
    <div ref={containerRef} className="min-h-screen bg-background relative">
      <Header showTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Spacer for fixed header with tabs */}
      <div className="h-24" />

      {/* Pull to refresh indicator */}
      <PullToRefreshIndicator 
        pullDistance={pullDistance} 
        isRefreshing={isRefreshing} 
        progress={progress} 
      />
      
      <main className="max-w-3xl mx-auto pb-safe">

        {/* Discover Sections - only show on For You tab */}
        {activeTab === 'for-you' && !poetsLoading && (
          <>
            <div className="space-y-6 py-4">
              {newPoets.length > 0 && (
                <DiscoverSection 
                  title="New Voices" 
                  subtitle="Fresh talent to discover"
                  poets={newPoets}
                  type="new"
                />
              )}

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
          </>
        )}

        {/* Poem Feed */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          
          {/* Loading State */}
          {currentData.loading && (
            <div className="space-y-4">
              <PoemCardSkeleton />
              <PoemCardSkeleton />
              <PoemCardSkeleton />
            </div>
          )}

          {/* Error State */}
          {currentData.error && !currentData.loading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mb-4" />
              <p className="text-muted-foreground mb-4">{currentData.error}</p>
              <Button onClick={currentData.refresh} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}

          {/* Empty State for Following Tab (not authenticated) */}
          {activeTab === 'following' && !isAuthenticated && !currentData.loading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">Sign in to see your feed</p>
              <p className="text-muted-foreground mb-4">Follow poets and see their work here</p>
              <Button asChild variant="default">
                <a href="/login">Sign In</a>
              </Button>
            </div>
          )}

          {/* Empty State for Following Tab (no follows) */}
          {activeTab === 'following' && isAuthenticated && !currentData.loading && !currentData.error && currentData.poems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">No poems from followed poets</p>
              <p className="text-muted-foreground mb-4">Follow poets to see their work in your feed</p>
              <Button asChild variant="default">
                <a href="/search">Discover Poets</a>
              </Button>
            </div>
          )}

          {/* Empty State for For You Tab (no top liked poems) */}
          {activeTab === 'for-you' && !currentData.loading && !currentData.error && currentData.poems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Star className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">No top liked poems yet</p>
              <p className="text-muted-foreground mb-4">Top liked poems from all poets will appear here.</p>
            </div>
          )}

          {/* Empty State for Recent Tab */}
          {activeTab === 'recent' && !currentData.loading && !currentData.error && currentData.poems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-lg font-medium text-foreground mb-2">No poems yet</p>
              <p className="text-muted-foreground mb-4">Be the first to share your poetry!</p>
              <Button asChild variant="default">
                <a href="/create">Write a Poem</a>
              </Button>
            </div>
          )}

          {/* Poems List */}
          {!currentData.loading && !currentData.error && currentData.poems.length > 0 && (
            <div>
              {currentData.poems.map((poem, index) => (
                <PoemCard key={poem.id} poem={poem} index={index} showProBadge={false} />
              ))}
            </div>
          )}
        </motion.section>

        {/* Load More / Infinite Scroll Trigger */}
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {currentData.loadingMore && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading more...</span>
            </div>
          )}
          {!currentData.loadingMore && currentData.hasMore && currentData.poems.length > 0 && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-sm text-muted-foreground"
            >
              Scroll for more poetry...
            </motion.div>
          )}
          {!currentData.hasMore && currentData.poems.length > 0 && (
            <p className="text-sm text-muted-foreground">You've reached the end ✨</p>
          )}
        </div>
      </main>

      <CreateButton />
    </div>
  );
};

export default Index;

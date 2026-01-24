import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader2, RefreshCw, AlertCircle, Users, TrendingUp } from 'lucide-react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { CreateButton } from '@/components/CreateButton';
import { FeedTabs } from '@/components/FeedTabs';
import { PoemCard } from '@/components/PoemCard';
import { DiscoverSection } from '@/components/DiscoverSection';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePublishedPoems } from '@/hooks/usePublishedPoems';
import { useFollowingPoems } from '@/hooks/useFollowingPoems';
import { useTrendingPoems } from '@/hooks/useTrendingPoems';
import { useDiscoverPoets } from '@/hooks/useDiscoverPoets';

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
  const [activeTab, setActiveTab] = useState('for-you');
  const { poems, isLoading, isLoadingMore, error, hasMore, loadMore, refresh } = usePublishedPoems();
  const { 
    poems: followingPoems, 
    isLoading: followingLoading, 
    error: followingError, 
    hasMore: followingHasMore, 
    loadMore: loadMoreFollowing, 
    refresh: refreshFollowing,
    isAuthenticated,
  } = useFollowingPoems();
  const {
    poems: trendingPoems,
    isLoading: trendingLoading,
    isLoadingMore: trendingLoadingMore,
    error: trendingError,
    hasMore: trendingHasMore,
    loadMore: loadMoreTrending,
    refresh: refreshTrending,
  } = useTrendingPoems();
  const { 
    trendingPoets, 
    risingPoets, 
    newPoets, 
    isLoading: poetsLoading 
  } = useDiscoverPoets();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Determine which data to show based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'following':
        return {
          poems: followingPoems,
          loading: followingLoading,
          loadingMore: false,
          error: followingError,
          hasMore: followingHasMore,
          loadMore: loadMoreFollowing,
          refresh: refreshFollowing,
        };
      case 'trending':
        return {
          poems: trendingPoems,
          loading: trendingLoading,
          loadingMore: trendingLoadingMore,
          error: trendingError,
          hasMore: trendingHasMore,
          loadMore: loadMoreTrending,
          refresh: refreshTrending,
        };
      default:
        return {
          poems,
          loading: isLoading,
          loadingMore: isLoadingMore,
          error,
          hasMore,
          loadMore,
          refresh,
        };
    }
  };

  const currentData = getCurrentData();
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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-2xl mx-auto pb-safe">
        {/* Feed Tabs */}
        <FeedTabs onTabChange={setActiveTab} />

        {/* Discover Sections - only show on For You tab */}
        {activeTab === 'for-you' && !poetsLoading && (
          <>
            <div className="space-y-6 py-4">
              {trendingPoets.length > 0 && (
                <DiscoverSection 
                  title="Trending Poets" 
                  subtitle="Most loved this week"
                  poets={trendingPoets}
                  type="trending"
                />
              )}
              
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
          className="px-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              {activeTab === 'following' && 'From Poets You Follow'}
              {activeTab === 'trending' && (
                <>
                  <TrendingUp className="w-4 h-4" />
                  Trending Now
                </>
              )}
              {activeTab === 'for-you' && 'Latest Poems'}
            </h2>
            {!currentData.loading && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={currentData.refresh}
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </div>
          
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
                <a href="/discover">Discover Poets</a>
              </Button>
            </div>
          )}

          {/* Empty State for Trending Tab */}
          {activeTab === 'trending' && !currentData.loading && !currentData.error && currentData.poems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <TrendingUp className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">No trending poems yet</p>
              <p className="text-muted-foreground mb-4">Check back later for popular poetry!</p>
            </div>
          )}

          {/* Empty State for For You Tab */}
          {activeTab === 'for-you' && !currentData.loading && !currentData.error && currentData.poems.length === 0 && (
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
            <div className="space-y-4">
              {currentData.poems.map((poem, index) => (
                <PoemCard key={poem.id} poem={poem} index={index} />
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
      <BottomNav />
    </div>
  );
};

export default Index;

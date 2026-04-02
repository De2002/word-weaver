import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Hash, Loader2, AlertCircle, Users, Star } from 'lucide-react';
import { PoemCard } from '@/components/PoemCard';
import { slugToTag, normalizeTag } from '@/lib/tags';
import { cn } from '@/lib/utils';
import { useSEO } from '@/hooks/useSEO';
import { useTagPoems } from '@/hooks/useTagPoems';
import { useTagMetadata } from '@/hooks/useTagMetadata';
import { useTagForYouPoems } from '@/hooks/useTagForYouPoems';
import { useTagFollowingPoems } from '@/hooks/useTagFollowingPoems';
import { Button } from '@/components/ui/button';

const feedTabs = [
  { value: 'for-you', label: 'For You' },
  { value: 'following', label: 'Following' },
  { value: 'recent', label: 'Recent' },
];

export default function TagPage() {
  const { tag } = useParams<{ tag: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('for-you');
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  const displayTag = tag ? slugToTag(tag) : '';
  
  useSEO({
    title: `#${displayTag}`,
    description: `Explore poems tagged with #${displayTag} on WordStack.`
  });

  // Fetch poems for different tabs
  const { poems: recentPoems, isLoading: recentLoading, hasMore: recentHasMore, loadMore: loadMoreRecent, totalCount } = useTagPoems(displayTag);
  const { poems: forYouPoems, isLoading: forYouLoading, error: forYouError, hasMore: forYouHasMore, loadMore: loadMoreForYou } = useTagForYouPoems(displayTag);
  const { poems: followingPoems, isLoading: followingLoading, error: followingError, hasMore: followingHasMore, loadMore: loadMoreFollowing, isAuthenticated } = useTagFollowingPoems(displayTag);
  
  const { data: tagMeta } = useTagMetadata(displayTag);

  // Get current data based on active tab
  const getCurrentData = useCallback(() => {
    switch (activeTab) {
      case 'following':
        return { poems: followingPoems, loading: followingLoading, error: followingError, hasMore: followingHasMore, loadMore: loadMoreFollowing, isAuthenticated };
      case 'recent':
        return { poems: recentPoems, loading: recentLoading, error: null, hasMore: recentHasMore, loadMore: loadMoreRecent, isAuthenticated: true };
      default: // for-you
        return { poems: forYouPoems, loading: forYouLoading, error: forYouError, hasMore: forYouHasMore, loadMore: loadMoreForYou, isAuthenticated: true };
    }
  }, [activeTab, recentPoems, recentLoading, recentHasMore, loadMoreRecent, forYouPoems, forYouLoading, forYouError, forYouHasMore, loadMoreForYou, followingPoems, followingLoading, followingError, followingHasMore, loadMoreFollowing, isAuthenticated]);

  const currentData = getCurrentData();

  const sortedPoems = useMemo(() => currentData.poems, [currentData.poems]);
  
  // Get related tags from fetched poems
  const normalizedTag = normalizeTag(displayTag);
  const relatedTags = useMemo(() => {
    const tagCounts = new Map<string, number>();
    recentPoems.forEach(poem => {
      poem.tags.forEach(t => {
        const normalized = normalizeTag(t);
        if (normalized !== normalizedTag) {
          tagCounts.set(normalized, (tagCounts.get(normalized) || 0) + 1);
        }
      });
    });
    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag);
  }, [recentPoems, normalizedTag]);

  // Infinite scroll observer
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && currentData.hasMore && !currentData.loading) {
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
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </motion.button>
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">{displayTag}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto pb-24">
        {/* Banner Image */}
        {tagMeta?.banner_url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative h-40 overflow-hidden"
          >
            <img
              src={tagMeta.banner_url}
              alt={`#${displayTag} banner`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/60" />
          </motion.div>
        )}

        {/* Tag Info */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 border-b border-border"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Hash className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">#{displayTag}</h1>
              <p className="text-sm text-muted-foreground">
                {recentLoading ? '...' : `${totalCount} ${totalCount === 1 ? 'poem' : 'poems'}`}
              </p>
            </div>
          </div>

          {/* Description */}
          {tagMeta?.description && (
            <p className="text-sm text-muted-foreground leading-relaxed mt-1 mb-3">
              {tagMeta.description}
            </p>
          )}
          
          {/* Related Tags */}
          {relatedTags.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-2">Related tags</p>
              <div className="flex flex-wrap gap-2">
                {relatedTags.map(relatedTag => (
                  <button
                    key={relatedTag}
                    onClick={() => navigate(`/tag/${encodeURIComponent(relatedTag)}`)}
                    className="text-sm px-3 py-1 rounded-full bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
                  >
                    #{relatedTag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Feed Tabs */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
          {feedTabs.map((feedTab) => {
            const isActive = activeTab === feedTab.value;
            return (
              <button
                key={feedTab.value}
                onClick={() => setActiveTab(feedTab.value)}
                className={cn(
                  "flex-1 text-center pb-2 text-sm font-medium transition-colors whitespace-nowrap border-b-2",
                  isActive
                    ? "text-primary border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                )}
              >
                {feedTab.label}
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {currentData.loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Error State */}
            {currentData.error && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                <p className="text-muted-foreground mb-4">{currentData.error}</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  <Loader2 className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            )}

            {/* Empty State for Following Tab (not authenticated) */}
            {activeTab === 'following' && !currentData.isAuthenticated && !currentData.loading && (
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
            {activeTab === 'following' && currentData.isAuthenticated && !currentData.loading && !currentData.error && sortedPoems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">No poems from followed poets</p>
                <p className="text-muted-foreground mb-4">Follow poets to see their tagged work in your feed</p>
              </div>
            )}

            {/* Empty State for For You Tab */}
            {activeTab === 'for-you' && !currentData.loading && !currentData.error && sortedPoems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Star className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">No top poems yet</p>
                <p className="text-muted-foreground mb-4">Top liked poems tagged with #{displayTag} will appear here</p>
              </div>
            )}

            {/* Empty State for Recent Tab */}
            {activeTab === 'recent' && !currentData.loading && !currentData.error && sortedPoems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Hash className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="font-medium text-lg mb-2">No poems found</h3>
                <p className="text-muted-foreground text-sm">
                  No poems have been tagged with #{displayTag} yet.
                </p>
              </div>
            )}

            {/* Poems List */}
            {!currentData.error && sortedPoems.length > 0 && (
              <div className="divide-y divide-border">
                {sortedPoems.map((poem, index) => (
                  <PoemCard key={poem.id} poem={poem} index={index} />
                ))}
              </div>
            )}

            {/* Load More Trigger */}
            <div ref={loadMoreRef} className="flex justify-center py-8">
              {!currentData.error && sortedPoems.length > 0 && (
                currentData.hasMore ? (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-sm text-muted-foreground"
                  >
                    Scroll for more poetry...
                  </motion.div>
                ) : (
                  <p className="text-sm text-muted-foreground">You've reached the end ✨</p>
                )
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

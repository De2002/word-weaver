import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Hash, Loader2, Users, Star, FileText, UserCircle2 } from 'lucide-react';
import { PoemCard } from '@/components/PoemCard';
import { slugToTag, normalizeTag } from '@/lib/tags';
import { cn } from '@/lib/utils';
import { useSEO } from '@/hooks/useSEO';
import { useTagPoems } from '@/hooks/useTagPoems';
import { useTagMetadata } from '@/hooks/useTagMetadata';
import { useTagForYouPoems } from '@/hooks/useTagForYouPoems';
import { useTagFollowingPoems } from '@/hooks/useTagFollowingPoems';
import { Button } from '@/components/ui/button';
import { PoemLoadError } from '@/components/PoemLoadError';

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
  const { poems: forYouPoems, isLoading: forYouLoading, error: forYouError, hasMore: forYouHasMore, loadMore: loadMoreForYou, refresh: refreshForYou } = useTagForYouPoems(displayTag);
  const { poems: followingPoems, isLoading: followingLoading, error: followingError, hasMore: followingHasMore, loadMore: loadMoreFollowing, refresh: refreshFollowing, isAuthenticated, followingCount } = useTagFollowingPoems(displayTag);
  
  const { data: tagMeta } = useTagMetadata(displayTag);
  const formatCount = useCallback((value: number) => value.toLocaleString(), []);

  // Get current data based on active tab
  const getCurrentData = useCallback(() => {
    switch (activeTab) {
      case 'following':
        return { poems: followingPoems, loading: followingLoading, error: followingError, hasMore: followingHasMore, loadMore: loadMoreFollowing, refresh: refreshFollowing, isAuthenticated };
      case 'recent':
        return { poems: recentPoems, loading: recentLoading, error: null, hasMore: recentHasMore, loadMore: loadMoreRecent, refresh: () => window.location.reload(), isAuthenticated: true };
      default: // for-you
        return { poems: forYouPoems, loading: forYouLoading, error: forYouError, hasMore: forYouHasMore, loadMore: loadMoreForYou, refresh: refreshForYou, isAuthenticated: true };
    }
  }, [activeTab, recentPoems, recentLoading, recentHasMore, loadMoreRecent, forYouPoems, forYouLoading, forYouError, forYouHasMore, loadMoreForYou, refreshForYou, followingPoems, followingLoading, followingError, followingHasMore, loadMoreFollowing, refreshFollowing, isAuthenticated]);

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

  const poetCount = useMemo(() => {
    return new Set(recentPoems.map((poem) => poem.poet.id)).size;
  }, [recentPoems]);

  const topPoets = useMemo(() => {
    const uniquePoets = new Map<string, { id: string; name: string; avatar: string }>();
    recentPoems.forEach((poem) => {
      if (!uniquePoets.has(poem.poet.id)) {
        uniquePoets.set(poem.poet.id, {
          id: poem.poet.id,
          name: poem.poet.name,
          avatar: poem.poet.avatar,
        });
      }
    });
    return Array.from(uniquePoets.values()).slice(0, 5);
  }, [recentPoems]);

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

      <main className="max-w-5xl mx-auto pb-24">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black text-white p-3 md:p-8 md:rounded-2xl md:mt-6"
        >
          <div className="grid gap-3 md:gap-6 md:grid-cols-[1fr,360px] md:items-start">
            <div>
              {tagMeta?.banner_url ? (
                <div className="relative overflow-hidden rounded-none md:rounded-lg h-28 md:h-56">
                  <img
                    src={tagMeta.banner_url}
                    alt={`#${displayTag} banner`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <h1 className="absolute inset-0 flex items-center justify-center text-3xl md:text-5xl font-serif tracking-wide">
                    {displayTag.toUpperCase()}
                  </h1>
                </div>
              ) : (
                <div className="rounded-none md:rounded-lg h-28 md:h-56 bg-neutral-800 flex items-center justify-center">
                  <h1 className="text-3xl md:text-4xl font-serif tracking-wide">{displayTag.toUpperCase()}</h1>
                </div>
              )}

              {tagMeta?.description && (
                <p className="mt-3 text-base md:text-xl leading-relaxed text-white/95">
                  {tagMeta.description}
                </p>
              )}
            </div>

            <div className="bg-zinc-100 text-zinc-900 rounded-2xl md:rounded-lg p-4 md:p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-300 pb-2">
                  <div className="flex items-center gap-2 text-base md:text-lg">
                    <FileText className="h-5 w-5 md:h-5 md:w-5 text-zinc-500" />
                    <span>Poems</span>
                  </div>
                  <span className="text-2xl md:text-2xl font-semibold">{recentLoading ? '...' : formatCount(totalCount)}</span>
                </div>

                <div className="flex items-center justify-between border-b border-zinc-300 pb-2">
                  <div className="flex items-center gap-2 text-base md:text-lg">
                    <UserCircle2 className="h-5 w-5 md:h-5 md:w-5 text-zinc-500" />
                    <span>Poets</span>
                  </div>
                  <span className="text-2xl md:text-2xl font-semibold">{recentLoading ? '...' : formatCount(poetCount)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-base md:text-lg">
                    <Users className="h-5 w-5 md:h-5 md:w-5 text-zinc-500" />
                    <span>Top Poets</span>
                  </div>
                  <div className="flex -space-x-2">
                    {topPoets.map((poet) => (
                      <img
                        key={poet.id}
                        src={poet.avatar}
                        alt={poet.name}
                        className="h-9 w-9 rounded-full border-2 border-zinc-100 object-cover"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/create-poetry')}
                className="w-full mt-4 bg-zinc-800 text-white rounded-xl py-3 md:py-3 text-base md:text-base font-semibold hover:bg-zinc-700 transition-colors"
              >
                Submit a Poem to {displayTag}
              </button>
            </div>
          </div>
        </motion.section>

        {/* Related Tags */}
        {relatedTags.length > 0 && (
          <div className="px-5 pt-4">
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

        {/* Feed Tabs */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border mt-3">
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
              <PoemLoadError error={currentData.error} onRetry={currentData.refresh} />
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
                {followingCount > 0 ? (
                  <>
                    <p className="text-lg font-medium text-foreground mb-2">No new posts from your followed poets</p>
                    <p className="text-muted-foreground mb-4">The poets you're following haven't published under #{displayTag} yet.</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-medium text-foreground mb-2">No poems from followed poets</p>
                    <p className="text-muted-foreground mb-4">Follow poets to see their tagged work in your feed.</p>
                  </>
                )}
              </div>
            )}

            {/* Empty State for For You Tab */}
            {activeTab === 'for-you' && !currentData.loading && !currentData.error && sortedPoems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Star className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">No top poems yet</p>
                <p className="text-muted-foreground mb-4">Poems gaining traction in likes, comments, and saves under #{displayTag} will appear here.</p>
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

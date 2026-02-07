import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Hash, Flame, Clock, TrendingUp, Award, Loader2 } from 'lucide-react';
import { PoemCard } from '@/components/PoemCard';
import { slugToTag, normalizeTag } from '@/lib/tags';
import { sortPoems, SortType } from '@/lib/ranking';
import { cn } from '@/lib/utils';
import { useSEO } from '@/hooks/useSEO';
import { useTagPoems } from '@/hooks/useTagPoems';
import { Button } from '@/components/ui/button';

const sortOptions: { value: SortType; label: string; icon: React.ElementType }[] = [
  { value: 'hot', label: 'Hot', icon: Flame },
  { value: 'new', label: 'New', icon: Clock },
  { value: 'top', label: 'Top', icon: Award },
  { value: 'rising', label: 'Rising', icon: TrendingUp },
];

export default function TagPage() {
  const { tag } = useParams<{ tag: string }>();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortType>('hot');
  
  const displayTag = tag ? slugToTag(tag) : '';
  
  useSEO({
    title: `#${displayTag}`,
    description: `Explore poems tagged with #${displayTag} on WordStack.`
  });

  const { poems, isLoading, isLoadingMore, hasMore, loadMore, totalCount } = useTagPoems(displayTag);

  // Sort poems client-side
  const sortedPoems = useMemo(() => sortPoems(poems, sortBy), [poems, sortBy]);
  
  // Get related tags from fetched poems
  const normalizedTag = normalizeTag(displayTag);
  const relatedTags = useMemo(() => {
    const tagCounts = new Map<string, number>();
    poems.forEach(poem => {
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
  }, [poems, normalizedTag]);

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
        {/* Tag Info */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 border-b border-border"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Hash className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">#{displayTag}</h1>
              <p className="text-sm text-muted-foreground">
                {isLoading ? '...' : `${totalCount} ${totalCount === 1 ? 'poem' : 'poems'}`}
              </p>
            </div>
          </div>
          
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

        {/* Sort Options */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-border overflow-x-auto scrollbar-hide">
          {sortOptions.map(option => {
            const Icon = option.icon;
            const isActive = sortBy === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {option.label}
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Poems List */}
            <div className="divide-y divide-border">
              {sortedPoems.length > 0 ? (
                sortedPoems.map((poem, index) => (
                  <PoemCard key={poem.id} poem={poem} index={index} />
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-8 text-center"
                >
                  <Hash className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-medium text-lg mb-2">No poems found</h3>
                  <p className="text-muted-foreground text-sm">
                    No poems have been tagged with #{displayTag} yet.
                  </p>
                </motion.div>
              )}
            </div>

            {/* Load More */}
            {hasMore && sortedPoems.length > 0 && (
              <div className="flex justify-center py-6">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

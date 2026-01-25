import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Book, Plus, LayoutGrid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BottomNav } from '@/components/BottomNav';
import { ChapbookCard } from '@/components/chapbooks/ChapbookCard';
import { ChapbookFiltersComponent } from '@/components/chapbooks/ChapbookFilters';
import { useChapbooks } from '@/hooks/useChapbooks';
import { ChapbookFilters } from '@/types/chapbook';
import { cn } from '@/lib/utils';

export default function ChapbooksStore() {
  const [filters, setFilters] = useState<ChapbookFilters>({});
  const [page, setPage] = useState(1);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const { data, isLoading, error } = useChapbooks(filters, page);

  const handleFiltersChange = (newFilters: ChapbookFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold flex items-center gap-2">
                <Book className="w-7 h-7" />
                Chapbooks Store
              </h1>
              <p className="text-muted-foreground mt-1 text-sm md:text-base">
                Discover chapbooks by poets from around the world. Click to buy from the original publisher or store.
              </p>
            </div>
            <Button asChild>
              <Link to="/chapbooks/submit">
                <Plus className="w-4 h-4 mr-2" />
                List a Chapbook
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <ChapbookFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClear={clearFilters}
        />

        {/* View toggle & results count */}
        <div className="flex items-center justify-between mt-4 mb-4">
          <p className="text-sm text-muted-foreground">
            {data?.totalCount ?? 0} chapbook{data?.totalCount !== 1 ? 's' : ''} found
          </p>
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={view === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 px-2"
              onClick={() => setView('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={view === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 px-2"
              onClick={() => setView('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className={cn(
            view === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
              : 'space-y-0 border rounded-lg overflow-hidden'
          )}>
            {Array.from({ length: 12 }).map((_, i) => (
              view === 'grid' ? (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ) : (
                <div key={i} className="flex items-center gap-4 p-3 border-b">
                  <Skeleton className="w-10 h-14" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              )
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Failed to load chapbooks. Please try again.</p>
          </div>
        ) : data?.chapbooks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Book className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No chapbooks found</h3>
            <p className="text-muted-foreground mb-4">
              {Object.keys(filters).length > 0
                ? 'Try adjusting your filters'
                : 'Be the first to list a chapbook!'}
            </p>
            {Object.keys(filters).length > 0 && (
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </motion.div>
        ) : (
          <>
            {view === 'grid' ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
              >
                {data?.chapbooks.map((chapbook) => (
                  <ChapbookCard key={chapbook.id} chapbook={chapbook} view="grid" />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border rounded-lg overflow-hidden"
              >
                {/* List header */}
                <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 p-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
                  <div className="w-10" />
                  <div>Title / Poet</div>
                  <div>Genre</div>
                  <div className="w-16 text-right">Price</div>
                  <div className="w-24" />
                </div>
                {data?.chapbooks.map((chapbook) => (
                  <ChapbookCard key={chapbook.id} chapbook={chapbook} view="list" />
                ))}
              </motion.div>
            )}

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-4">
                  Page {data.currentPage} of {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

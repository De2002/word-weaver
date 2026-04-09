import { useEffect, useRef, useState } from 'react';
import { Search, PenLine, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QuestionCard } from '@/components/qa/QuestionCard';
import { AskQuestionForm } from '@/components/qa/AskQuestionForm';
import { useQA } from '@/hooks/useQA';
import { useAuth } from '@/context/AuthProvider';
import { QA_CATEGORIES, QACategory } from '@/types/qa';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function QA() {
  const { user } = useAuth();
  const [category, setCategory] = useState<QACategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showAskForm, setShowAskForm] = useState(false);
  const categoryScrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const { questions, isLoading, isLoadingMore, hasMore, loadMore, askQuestion } = useQA({
    category,
    search,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const updateScrollButtons = () => {
    const el = categoryScrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    const el = categoryScrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === 'left' ? -180 : 180,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    updateScrollButtons();
    const handleResize = () => updateScrollButtons();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-10">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                <h1 className="font-serif text-xl font-semibold">Q&A</h1>
              </div>
              {user && (
                <Button
                  size="sm"
                  onClick={() => setShowAskForm(true)}
                  className="gap-1.5 lg:hidden"
                >
                  <PenLine className="h-3.5 w-3.5" />
                  Ask
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3 lg:flex-1 lg:justify-end lg:max-w-2xl">
              {/* Search */}
              <form onSubmit={handleSearch} className="relative flex-1 lg:max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Search questions…"
                  className="pl-9 h-9 text-sm"
                />
              </form>

              {user && (
                <Button
                  size="sm"
                  onClick={() => setShowAskForm(true)}
                  className="gap-1.5 hidden lg:inline-flex"
                >
                  <PenLine className="h-3.5 w-3.5" />
                  Ask Question
                </Button>
              )}
            </div>
          </div>

          {/* Category pills */}
          <div className="mt-3 flex items-center gap-2 pb-1 lg:hidden">
            {canScrollLeft && (
              <button
                type="button"
                aria-label="Scroll categories left"
                onClick={() => scrollCategories('left')}
                className="h-7 w-7 shrink-0 rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}

            <div
              ref={categoryScrollRef}
              onScroll={updateScrollButtons}
              className="flex-1 min-w-0 flex gap-2 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              <button
                onClick={() => setCategory('all')}
                className={cn(
                  'text-xs px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap shrink-0',
                  category === 'all'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:text-foreground'
                )}
              >
                All
              </button>
              {QA_CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={cn(
                    'text-xs px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap shrink-0',
                    category === cat.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {canScrollRight && (
              <button
                type="button"
                aria-label="Scroll categories right"
                onClick={() => scrollCategories('right')}
                className="h-7 w-7 shrink-0 rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4 lg:py-6 lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-6">
        <aside className="hidden lg:block">
          <div className="sticky top-[96px] rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">Categories</p>
            <div className="space-y-2">
              <button
                onClick={() => setCategory('all')}
                className={cn(
                  'w-full text-left text-sm px-3 py-2 rounded-lg border transition-colors',
                  category === 'all'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:bg-secondary/30'
                )}
              >
                All questions
              </button>
              {QA_CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={cn(
                    'w-full text-left text-sm px-3 py-2 rounded-lg border transition-colors',
                    category === cat.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:text-foreground hover:bg-secondary/30'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="rounded-xl border border-border bg-card overflow-hidden">
          {isLoading ? (
            <div className="space-y-0">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="px-4 py-4 border-b border-border">
                  <div className="flex gap-3">
                    <Skeleton className="w-12 h-12 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-16 px-4">
              <HelpCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-serif text-lg font-medium mb-1">No questions yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                {search ? 'Try a different search term.' : 'Be the first to ask a question.'}
              </p>
              {user && (
                <Button onClick={() => setShowAskForm(true)} variant="outline" size="sm">
                  Ask a question
                </Button>
              )}
            </div>
          ) : (
            <>
              {questions.map(q => (
                <QuestionCard key={q.id} question={q} />
              ))}
              {hasMore && (
                <div className="p-4 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadMore}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? 'Loading…' : 'Load more'}
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Ask form modal */}
      {showAskForm && (
        <AskQuestionForm
          onSubmit={askQuestion}
          onClose={() => setShowAskForm(false)}
        />
      )}

      {/* Guest CTA */}
      {!user && (
        <div className="fixed bottom-20 left-0 right-0 px-4 lg:bottom-6">
          <div className="max-w-6xl mx-auto lg:flex lg:justify-end">
            <div className="bg-background border border-border rounded-xl px-4 py-3 flex items-center justify-between gap-4 shadow-lg lg:w-full lg:max-w-sm">
              <p className="text-sm text-muted-foreground">Sign in to ask questions</p>
              <Button size="sm" asChild>
                <a href="/login">Sign in</a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

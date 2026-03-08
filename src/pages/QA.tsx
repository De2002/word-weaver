import { useState } from 'react';
import { Search, PenLine, HelpCircle, Star } from 'lucide-react';
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

  const { questions, isLoading, isLoadingMore, hasMore, loadMore, askQuestion } = useQA({
    category,
    search,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              <h1 className="font-serif text-xl font-semibold">Q&A</h1>
            </div>
            {user && (
              <Button
                size="sm"
                onClick={() => setShowAskForm(true)}
                className="gap-1.5"
              >
                <PenLine className="h-3.5 w-3.5" />
                Ask
              </Button>
            )}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search questions…"
              className="pl-9 h-9 text-sm"
            />
          </form>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setCategory('all')}
              className={cn(
                "shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors",
                category === 'all'
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              All
            </button>
            {QA_CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={cn(
                  "shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap",
                  category === cat.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Featured banner */}
        {category === 'all' && !search && (
          <div className="mx-4 mt-4 mb-2 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500 shrink-0 fill-amber-500" />
            <p className="text-sm text-foreground">
              <span className="font-medium">Only Pro Poets can answer.</span>{' '}
              <span className="text-muted-foreground">Answers come from experienced poets you can trust.</span>
            </p>
          </div>
        )}

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
        <div className="fixed bottom-20 left-0 right-0 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-background border border-border rounded-xl px-4 py-3 flex items-center justify-between shadow-lg">
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

import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search as SearchIcon, 
  ArrowLeft, 
  User, 
  FileText, 
  Hash,
  Loader2,
  X
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSearch, SearchResult } from '@/hooks/useSearch';
import { cn } from '@/lib/utils';
import { useSEO } from '@/hooks/useSEO';

function SearchResultItem({ result, onClick }: { result: SearchResult; onClick: () => void }) {
  const getIcon = () => {
    switch (result.type) {
      case 'poet':
        return result.avatarUrl ? (
          <Avatar className="h-10 w-10">
            <AvatarImage src={result.avatarUrl} alt={result.title} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {result.title.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
        );
      case 'poem':
        return (
          <div className="h-10 w-10 rounded-lg bg-warm-gold/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-warm-gold" />
          </div>
        );
      case 'tag':
        return (
          <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
            <Hash className="h-5 w-5 text-muted-foreground" />
          </div>
        );
    }
  };

  const getTypeLabel = () => {
    switch (result.type) {
      case 'poet': return 'Poet';
      case 'poem': return 'Poem';
      case 'tag': return 'Tag';
    }
  };

  return (
    <Link
      to={result.href}
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/80 transition-colors group"
    >
      {getIcon()}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {result.title}
        </p>
        {result.subtitle && (
          <p className="text-sm text-muted-foreground truncate">
            {result.subtitle}
          </p>
        )}
      </div>
      <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
        {getTypeLabel()}
      </span>
    </Link>
  );
}

function SearchGroup({ 
  title, 
  icon: Icon, 
  results, 
  onResultClick 
}: { 
  title: string; 
  icon: React.ElementType; 
  results: SearchResult[]; 
  onResultClick: () => void;
}) {
  if (results.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-1"
    >
      <div className="flex items-center gap-2 px-3 py-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
      </div>
      {results.map((result) => (
        <SearchResultItem 
          key={`${result.type}-${result.id}`} 
          result={result} 
          onClick={onResultClick}
        />
      ))}
    </motion.div>
  );
}

export default function Search() {
  useSEO({
    title: "Search",
    description: "Search WordStack for poets, poems, and tags."
  });

  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const { query, setQuery, isLoading, groupedResults } = useSearch();

  const hasResults = groupedResults.poets.length > 0 || 
                     groupedResults.poems.length > 0 || 
                     groupedResults.tags.length > 0;

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleResultClick = () => {
    setQuery('');
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Search Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 px-3 py-2">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-secondary transition-colors shrink-0"
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </button>

            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                ) : (
                  <SearchIcon className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search poets, poems, tags..."
                className={cn(
                  "w-full h-11 pl-11 pr-10 rounded-full",
                  "bg-secondary border-0",
                  "text-foreground placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary/30",
                  "transition-all"
                )}
              />
              {query && (
                <button
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-background/50 transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Search Results */}
      <main className="max-w-2xl mx-auto px-2 py-4">
        <AnimatePresence mode="wait">
          {/* Empty State - Initial */}
          {!query && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <SearchIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-foreground mb-2">
                Search WordStack
              </p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Find poets by name or username, discover poems, or explore tags
              </p>
            </motion.div>
          )}

          {/* Loading State */}
          {query && isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-16"
            >
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </motion.div>
          )}

          {/* Results */}
          {query && !isLoading && hasResults && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <SearchGroup
                title="Poets"
                icon={User}
                results={groupedResults.poets}
                onResultClick={handleResultClick}
              />
              <SearchGroup
                title="Poems"
                icon={FileText}
                results={groupedResults.poems}
                onResultClick={handleResultClick}
              />
              <SearchGroup
                title="Tags"
                icon={Hash}
                results={groupedResults.tags}
                onResultClick={handleResultClick}
              />
            </motion.div>
          )}

          {/* No Results */}
          {query && !isLoading && !hasResults && (
            <motion.div
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <p className="text-lg font-medium text-foreground mb-2">
                No results found
              </p>
              <p className="text-sm text-muted-foreground">
                Try searching for something else
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

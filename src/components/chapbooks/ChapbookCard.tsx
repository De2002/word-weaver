import { motion } from 'framer-motion';
import { Book, ExternalLink, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Chapbook } from '@/types/chapbook';
import { useChapbookSave } from '@/hooks/useChapbooks';
import { useAuth } from '@/context/AuthProvider';
import { cn } from '@/lib/utils';

interface ChapbookCardProps {
  chapbook: Chapbook;
  view?: 'grid' | 'list';
}

export function ChapbookCard({ chapbook, view = 'grid' }: ChapbookCardProps) {
  const { user } = useAuth();
  const { isSaved, toggleSave } = useChapbookSave(chapbook.id);

  const formatPrice = () => {
    if (chapbook.is_free) return 'Free';
    if (!chapbook.price) return 'Price varies';
    return `$${chapbook.price.toFixed(2)}`;
  };

  const getFormatLabel = () => {
    switch (chapbook.format) {
      case 'pdf': return 'PDF';
      case 'print': return 'Print';
      case 'ebook': return 'eBook';
      case 'multiple': return 'Multiple';
      default: return chapbook.format;
    }
  };

  if (view === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-4 p-3 border-b border-border hover:bg-muted/50 transition-colors"
      >
        {chapbook.cover_url ? (
          <img
            src={chapbook.cover_url}
            alt={chapbook.title}
            className="w-10 h-14 object-cover rounded shadow-sm flex-shrink-0"
            loading="lazy"
          />
        ) : (
          <div className="w-10 h-14 bg-muted rounded flex items-center justify-center flex-shrink-0">
            <Book className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <Link to={`/chapbooks/${chapbook.id}`} className="font-medium hover:text-primary truncate block">
            {chapbook.title}
          </Link>
          <p className="text-sm text-muted-foreground truncate">by {chapbook.poet_name}</p>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          {chapbook.genre_tags.slice(0, 1).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="text-sm font-medium w-16 text-right">
          {formatPrice()}
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/chapbooks/${chapbook.id}`}>View</Link>
          </Button>
          {user && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => toggleSave.mutate()}
            >
              <Heart className={cn('w-4 h-4', isSaved && 'fill-destructive text-destructive')} />
            </Button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-card rounded-lg border border-border overflow-hidden hover:shadow-md transition-all duration-200"
    >
      <Link to={`/chapbooks/${chapbook.id}`} className="block">
        <div className="aspect-[3/4] bg-muted relative overflow-hidden">
          {chapbook.cover_url ? (
            <img
              src={chapbook.cover_url}
              alt={chapbook.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Book className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
          
          {chapbook.is_free && (
            <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
              Free
            </Badge>
          )}
        </div>
      </Link>

      <div className="p-3">
        <Link to={`/chapbooks/${chapbook.id}`}>
          <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
            {chapbook.title}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
          by {chapbook.poet_name}
        </p>
        
        <div className="flex items-center gap-1 mt-2 flex-wrap">
          {chapbook.genre_tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
              {tag}
            </Badge>
          ))}
          <Badge variant="secondary" className="text-xs px-1.5 py-0">
            {getFormatLabel()}
          </Badge>
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className={cn(
            'text-sm font-semibold',
            chapbook.is_free ? 'text-primary' : 'text-foreground'
          )}>
            {formatPrice()}
          </span>
          
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 text-xs px-2" asChild>
              <Link to={`/chapbooks/${chapbook.id}`}>
                View
              </Link>
            </Button>
            {Object.keys(chapbook.external_links).length > 0 && (
              <Button variant="default" size="sm" className="h-7 text-xs px-2" asChild>
                <a 
                  href={chapbook.external_links.publisher || chapbook.external_links.amazon || chapbook.external_links.other} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  Buy <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {user && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 left-2 h-8 w-8 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.preventDefault();
            toggleSave.mutate();
          }}
        >
          <Heart className={cn('w-4 h-4', isSaved && 'fill-destructive text-destructive')} />
        </Button>
      )}
    </motion.div>
  );
}

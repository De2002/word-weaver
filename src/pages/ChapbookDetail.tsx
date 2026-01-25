import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Book, 
  Calendar, 
  MapPin, 
  ExternalLink, 
  Heart,
  Share2,
  ShoppingCart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { BottomNav } from '@/components/BottomNav';
import { useChapbook, useChapbookSave } from '@/hooks/useChapbooks';
import { useAuth } from '@/context/AuthProvider';
import { useNativeShare } from '@/hooks/useNativeShare';
import { cn } from '@/lib/utils';
import { CHAPBOOK_FORMATS } from '@/types/chapbook';

export default function ChapbookDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { share } = useNativeShare();

  const { data: chapbook, isLoading, error } = useChapbook(id!);
  const { isSaved, toggleSave } = useChapbookSave(id!);

  const formatPrice = () => {
    if (!chapbook) return '';
    if (chapbook.is_free) return 'Free';
    if (!chapbook.price) return 'Price varies';
    
    const currencySymbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      KES: 'KSh ',
    };
    const symbol = currencySymbols[chapbook.currency] || chapbook.currency + ' ';
    return `${symbol}${chapbook.price.toFixed(2)}`;
  };

  const handleShare = () => {
    if (chapbook) {
      share({
        title: chapbook.title,
        text: `Check out "${chapbook.title}" by ${chapbook.poet_name}`,
        url: window.location.href,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-6">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Skeleton className="h-8 w-24 mb-6" />
          <div className="grid md:grid-cols-[300px_1fr] gap-8">
            <Skeleton className="aspect-[3/4] w-full rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (error || !chapbook) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-6">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Button variant="ghost" onClick={() => navigate('/chapbooks')} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Store
          </Button>
          <div className="text-center py-16">
            <Book className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-medium mb-2">Chapbook not found</h2>
            <p className="text-muted-foreground">This chapbook may have been removed or doesn't exist.</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  const externalLinks = chapbook.external_links as { publisher?: string; amazon?: string; other?: string };
  const hasLinks = Object.keys(externalLinks).length > 0;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Button variant="ghost" onClick={() => navigate('/chapbooks')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Store
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-[300px_1fr] gap-8"
        >
          {/* Cover Image */}
          <div className="relative">
            <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden shadow-lg">
              {chapbook.cover_url ? (
                <img
                  src={chapbook.cover_url}
                  alt={chapbook.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Book className="w-20 h-20 text-muted-foreground" />
                </div>
              )}
            </div>
            {chapbook.is_free && (
              <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground text-sm">
                Free
              </Badge>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold">{chapbook.title}</h1>
            <p className="text-lg text-muted-foreground mt-1">by {chapbook.poet_name}</p>

            {/* Price */}
            <div className={cn(
              'text-2xl font-bold mt-4',
              chapbook.is_free ? 'text-primary' : 'text-foreground'
            )}>
              {formatPrice()}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {chapbook.genre_tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
              <Badge variant="outline">
                {CHAPBOOK_FORMATS.find(f => f.value === chapbook.format)?.label || chapbook.format}
              </Badge>
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
              {chapbook.year && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {chapbook.year}
                </span>
              )}
              {chapbook.country && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {chapbook.country}
                </span>
              )}
            </div>

            <Separator className="my-6" />

            {/* Description */}
            {chapbook.description && (
              <div className="mb-6">
                <h3 className="font-medium mb-2">About this chapbook</h3>
                <p className="text-muted-foreground whitespace-pre-line">{chapbook.description}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-3">
              {/* Purchase links */}
              {hasLinks && (
                <div className="space-y-2">
                  {externalLinks.publisher && (
                    <Button asChild className="w-full" size="lg">
                      <a href={externalLinks.publisher} target="_blank" rel="noopener noreferrer">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Buy on Publisher Site
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  )}
                  {externalLinks.amazon && (
                    <Button asChild variant="outline" className="w-full" size="lg">
                      <a href={externalLinks.amazon} target="_blank" rel="noopener noreferrer">
                        Buy on Amazon
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  )}
                  {externalLinks.other && !externalLinks.publisher && !externalLinks.amazon && (
                    <Button asChild className="w-full" size="lg">
                      <a href={externalLinks.other} target="_blank" rel="noopener noreferrer">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Buy Now
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  )}
                </div>
              )}

              {!hasLinks && (
                <p className="text-sm text-muted-foreground italic">
                  No purchase links available for this chapbook.
                </p>
              )}

              {/* Save and Share */}
              <div className="flex gap-2">
                {user && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => toggleSave.mutate()}
                    disabled={toggleSave.isPending}
                  >
                    <Heart className={cn('w-4 h-4 mr-2', isSaved && 'fill-red-500 text-red-500')} />
                    {isSaved ? 'Saved' : 'Save'}
                  </Button>
                )}
                <Button variant="outline" className="flex-1" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}

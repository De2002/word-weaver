import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Footprints } from 'lucide-react';
import { Trail, TRAIL_MOODS } from '@/types/trail';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface TrailCardProps {
  trail: Trail;
  index?: number;
  progress?: number; // current step / total steps
}

export function TrailCard({ trail, index = 0, progress }: TrailCardProps) {
  const progressPercent = progress && trail.step_count 
    ? Math.round((progress / trail.step_count) * 100) 
    : 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/trails/${trail.id}`}
        className="block group"
      >
        <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all">
          {/* Cover Image */}
          {trail.cover_url ? (
            <div className="aspect-[2/1] overflow-hidden">
              <img
                src={trail.cover_url}
                alt={trail.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="aspect-[2/1] bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center">
              <MapPin className="h-12 w-12 text-primary/40" />
            </div>
          )}

          <div className="p-4">
            {/* Category Badge */}
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs capitalize">
                {trail.category}
              </Badge>
              {trail.mood && (
                <Badge variant="outline" className="text-xs">
                  {trail.mood}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h3 className="font-serif text-lg font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
              {trail.title}
            </h3>

            {/* Description */}
            {trail.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {trail.description}
              </p>
            )}

            {/* Steps count */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Footprints className="h-4 w-4" />
              <span>{trail.step_count} {trail.step_count === 1 ? 'poem' : 'poems'}</span>
            </div>

            {/* Progress bar (if user has started) */}
            {progress !== undefined && progress > 0 && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>{progress}/{trail.step_count}</span>
                </div>
                <Progress value={progressPercent} className="h-1.5" />
              </div>
            )}

            {/* Curator */}
            {trail.curator && (
              <div className="flex items-center gap-2 pt-3 border-t border-border">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={trail.curator.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {(trail.curator.display_name || trail.curator.username || 'C').charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  Curated by {trail.curator.display_name || trail.curator.username || 'Anonymous'}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

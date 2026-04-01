import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Loader2, Hash } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { normalizeTag, tagToSlug } from '@/lib/tags';
import { usePoemCountByTag } from '@/hooks/usePoemCountByTag';

interface TagWithCount {
  id: string;
  tag: string;
  description: string | null;
  banner_url: string | null;
  image_url: string | null;
  created_at: string;
  poemCount: number;
}

export default function ExploreTags() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { counts: poemCounts } = usePoemCountByTag();

  useSEO({
    title: 'Explore Tags',
    description: 'Explore all poetry tags and discover poems by category.',
  });

  // Fetch all tags
  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['all-tags'],
    queryFn: async () => {
      const { data, error } = await db
        .from('tag_metadata')
        .select('*')
        .order('tag', { ascending: true });

      if (error) throw error;

      return (data || []).map((tag) => ({
        ...tag,
        poemCount: poemCounts[tag.tag] || 0,
      })) as TagWithCount[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Filter tags based on search query
  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) {
      // Sort by poem count descending
      return [...tags].sort((a, b) => b.poemCount - a.poemCount);
    }

    const query = normalizeTag(searchQuery);
    return tags
      .filter(
        (tag) =>
          normalizeTag(tag.tag).includes(query) ||
          tag.description?.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => {
        // Prioritize exact matches
        const aExact = normalizeTag(tag.tag) === query;
        const bExact = normalizeTag(b.tag) === query;
        if (aExact !== bExact) return bExact ? 1 : -1;

        // Then sort by poem count
        return b.poemCount - a.poemCount;
      });
  }, [tags, searchQuery]);

  const handleTagClick = (tag: string) => {
    navigate(`/tag/${tagToSlug(tag)}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 md:py-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">Explore Tags</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 pb-24 md:pb-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredTags.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Hash className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-medium text-lg mb-2">No tags found</h3>
            <p className="text-muted-foreground">
              {tags.length === 0
                ? 'No tags have been created yet'
                : 'No tags match your search'}
            </p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredTags.map((tag) => (
              <motion.div key={tag.id} variants={itemVariants}>
                <button
                  onClick={() => handleTagClick(tag.tag)}
                  className="group h-full w-full text-left"
                >
                  <div className="relative h-48 bg-secondary/50 rounded-lg overflow-hidden border border-border transition-all duration-300 hover:border-primary/50 hover:shadow-md cursor-pointer">
                    {/* Image or placeholder */}
                    {tag.image_url || tag.banner_url ? (
                      <>
                        <img
                          src={tag.image_url || tag.banner_url || ''}
                          alt={tag.tag}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <Hash className="h-12 w-12 text-muted-foreground/40" />
                      </div>
                    )}

                    {/* Content overlay */}
                    <div className="absolute inset-0 flex flex-col justify-between p-4">
                      <div />
                      <div>
                        <h3 className="font-semibold text-lg text-white mb-2 line-clamp-1">
                          #{tag.tag}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="inline-block px-2 py-1 rounded bg-primary/80 text-white text-xs font-medium">
                            {tag.poemCount} poem{tag.poemCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {tag.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2 group-hover:text-foreground transition-colors">
                      {tag.description}
                    </p>
                  )}
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

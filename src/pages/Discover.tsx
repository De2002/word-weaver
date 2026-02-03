import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Sprout, ArrowLeft } from 'lucide-react';
import { PoetCard } from '@/components/PoetCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useDiscoverPoets } from '@/hooks/useDiscoverPoets';
import { cn } from '@/lib/utils';
import { useSEO } from '@/hooks/useSEO';

function PoetCardSkeleton() {
  return (
    <div className="card-poem p-4 flex items-start gap-3">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}

const sectionConfig = {
  trending: {
    id: 'trending',
    title: 'Trending Poets',
    subtitle: 'Most loved this week',
    icon: Sparkles,
    gradient: 'from-primary to-warm-gold',
    bg: 'bg-gradient-to-r from-primary/5 to-warm-gold/5',
  },
  rising: {
    id: 'rising',
    title: 'Rising Stars',
    subtitle: 'Gaining momentum',
    icon: TrendingUp,
    gradient: 'from-soft-coral to-primary',
    bg: 'bg-soft-coral/5',
  },
  new: {
    id: 'new',
    title: 'New Voices',
    subtitle: 'Fresh perspectives',
    icon: Sprout,
    gradient: 'from-sage to-sage',
    bg: 'bg-sage/5',
  },
};

export default function Discover() {
  useSEO({
    title: "Discover Poets",
    description: "Discover trending poets, rising stars, and new voices in the poetry community."
  });

  const { trendingPoets, risingPoets, newPoets, allPoets, isLoading, error } = useDiscoverPoets();

  const sections = [
    { ...sectionConfig.trending, poets: trendingPoets },
    { ...sectionConfig.rising, poets: risingPoets },
    { ...sectionConfig.new, poets: newPoets },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <motion.a
            href="/home"
            whileTap={{ scale: 0.95 }}
            className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.a>
          <h1 className="text-xl font-semibold">Discover</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto pb-24">
        <div className="space-y-6 py-4">
          {isLoading ? (
            // Loading state
            <>
              {[0, 1, 2].map((sectionIndex) => (
                <section key={sectionIndex} className="space-y-3">
                  <div className="flex items-center gap-2 px-4">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="mx-4 rounded-xl p-3 bg-secondary/30">
                    <div className="space-y-3">
                      <PoetCardSkeleton />
                      <PoetCardSkeleton />
                    </div>
                  </div>
                </section>
              ))}
            </>
          ) : error ? (
            // Error state
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : (
            // Poet sections
            sections.map((section, sectionIndex) => {
              const Icon = section.icon;
              
              // Skip empty sections
              if (section.poets.length === 0) return null;
              
              return (
                <motion.section
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: sectionIndex * 0.1 }}
                  className="space-y-3"
                >
                  {/* Section Header */}
                  <div className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "p-1.5 rounded-lg bg-gradient-to-r",
                        section.gradient
                      )}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{section.title}</h3>
                        <p className="text-xs text-muted-foreground">{section.subtitle}</p>
                      </div>
                    </div>
                    <button className="text-xs text-primary font-medium hover:underline">
                      See all
                    </button>
                  </div>

                  {/* Poets Grid */}
                  <div className={cn(
                    "mx-4 rounded-xl p-3",
                    section.bg
                  )}>
                    <div className="grid grid-cols-1 gap-3">
                      {section.poets.slice(0, 3).map((poet, index) => (
                        <PoetCard 
                          key={poet.id} 
                          poet={poet} 
                          index={index} 
                          variant="full" 
                        />
                      ))}
                    </div>
                  </div>
                </motion.section>
              );
            })
          )}

          {/* Browse All Section */}
          {!isLoading && !error && allPoets.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="px-4 pt-4"
            >
              <h3 className="font-semibold text-sm mb-3">Browse All Poets</h3>
              <div className="grid grid-cols-2 gap-3">
                {allPoets.slice(0, 8).map((poet, index) => (
                  <PoetCard 
                    key={poet.id} 
                    poet={poet} 
                    index={index} 
                    variant="compact" 
                  />
                ))}
              </div>
            </motion.section>
          )}

          {/* Empty state when no poets */}
          {!isLoading && !error && allPoets.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <Sprout className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No poets yet</p>
              <p className="text-muted-foreground">Be the first to share your poetry!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

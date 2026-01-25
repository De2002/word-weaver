import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Map } from 'lucide-react';
import { Header } from '@/components/Header';
import { CreateButton } from '@/components/CreateButton';
import { TrailCard } from '@/components/trails/TrailCard';
import { TrailFilters } from '@/components/trails/TrailFilters';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTrails } from '@/hooks/useTrails';
import { useAuth } from '@/context/AuthProvider';
import { TrailCategory } from '@/types/trail';

export default function Trails() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<TrailCategory | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const { data: trails, isLoading } = useTrails(selectedCategory || undefined);

  // Filter by mood client-side
  const filteredTrails = trails?.filter((trail) => {
    if (selectedMood && trail.mood !== selectedMood) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-semibold text-foreground font-poem flex items-center gap-2"
            >
              <Map className="h-6 w-6 text-primary" />
              Trails
            </motion.h1>
            <p className="text-sm text-muted-foreground mt-1">
              Guided poetry journeys to walk through
            </p>
          </div>
          
          {user && (
            <Button asChild>
              <Link to="/trails/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Trail
              </Link>
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6">
          <TrailFilters
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedMood={selectedMood}
            onMoodChange={setSelectedMood}
          />
        </div>

        {/* Trails Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
                <Skeleton className="aspect-[2/1]" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredTrails && filteredTrails.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTrails.map((trail, index) => (
              <TrailCard key={trail.id} trail={trail} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Map className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No trails yet</h3>
            <p className="text-muted-foreground mb-6">
              {selectedCategory || selectedMood
                ? "No trails match your filters. Try adjusting them."
                : "Be the first to create a guided poetry journey."}
            </p>
            {user && (
              <Button asChild>
                <Link to="/trails/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Trail
                </Link>
              </Button>
            )}
          </div>
        )}
      </main>

      <CreateButton />
    </div>
  );
}

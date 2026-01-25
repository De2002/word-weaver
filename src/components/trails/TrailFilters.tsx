import { motion } from 'framer-motion';
import { Map, Heart, Sparkles, Flame } from 'lucide-react';
import { TrailCategory, TRAIL_MOODS } from '@/types/trail';
import { cn } from '@/lib/utils';

interface TrailFiltersProps {
  selectedCategory: TrailCategory | null;
  onCategoryChange: (category: TrailCategory | null) => void;
  selectedMood: string | null;
  onMoodChange: (mood: string | null) => void;
}

const categories: { value: TrailCategory | null; label: string; icon: React.ElementType }[] = [
  { value: null, label: 'All', icon: Map },
  { value: 'theme', label: 'Theme', icon: Sparkles },
  { value: 'emotion', label: 'Emotion', icon: Heart },
  { value: 'challenge', label: 'Challenge', icon: Flame },
];

export function TrailFilters({
  selectedCategory,
  onCategoryChange,
  selectedMood,
  onMoodChange,
}: TrailFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.value;
          
          return (
            <motion.button
              key={cat.label}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCategoryChange(cat.value)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              <Icon className="h-4 w-4" />
              {cat.label}
            </motion.button>
          );
        })}
      </div>

      {/* Mood filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => onMoodChange(null)}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
            !selectedMood
              ? "bg-primary/20 text-primary border border-primary/30"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          All Moods
        </button>
        {TRAIL_MOODS.map((mood) => (
          <button
            key={mood}
            onClick={() => onMoodChange(mood)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
              selectedMood === mood
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {mood}
          </button>
        ))}
      </div>
    </div>
  );
}

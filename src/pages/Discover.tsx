import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Sprout, Search, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PoetCard } from '@/components/PoetCard';
import { BottomNav } from '@/components/BottomNav';
import { trendingPoets, newPoets, risingPoets, mockPoets } from '@/data/mockData';
import { cn } from '@/lib/utils';

const sections = [
  {
    id: 'trending',
    title: 'Trending Poets',
    subtitle: 'Most read this week',
    icon: Sparkles,
    gradient: 'from-primary to-warm-gold',
    bg: 'bg-gradient-to-r from-primary/5 to-warm-gold/5',
    poets: trendingPoets.length > 0 ? trendingPoets : mockPoets.slice(0, 2),
  },
  {
    id: 'rising',
    title: 'Rising Stars',
    subtitle: 'Gaining momentum',
    icon: TrendingUp,
    gradient: 'from-soft-coral to-primary',
    bg: 'bg-soft-coral/5',
    poets: risingPoets.length > 0 ? risingPoets : mockPoets.slice(1, 3),
  },
  {
    id: 'new',
    title: 'New Voices',
    subtitle: 'Fresh perspectives',
    icon: Sprout,
    gradient: 'from-sage to-sage',
    bg: 'bg-sage/5',
    poets: newPoets.length > 0 ? newPoets : mockPoets.slice(2, 4),
  },
];

export default function Discover() {
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
        
        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search poets, poems, tags..."
              className="pl-10 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto pb-24">
        <div className="space-y-6 py-4">
          {sections.map((section, sectionIndex) => {
            const Icon = section.icon;
            
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
                    {section.poets.map((poet, index) => (
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
          })}

          {/* Browse All Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="px-4 pt-4"
          >
            <h3 className="font-semibold text-sm mb-3">Browse All Poets</h3>
            <div className="grid grid-cols-2 gap-3">
              {mockPoets.map((poet, index) => (
                <PoetCard 
                  key={poet.id} 
                  poet={poet} 
                  index={index} 
                  variant="compact" 
                />
              ))}
            </div>
          </motion.section>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

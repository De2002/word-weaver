import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { FeedTabs } from '@/components/FeedTabs';
import { PoemCard } from '@/components/PoemCard';
import { DiscoverSection } from '@/components/DiscoverSection';
import { AppSidebar } from '@/components/AppSidebar';
import { mockPoems, trendingPoets, newPoets, risingPoets, mockPoets } from '@/data/mockData';

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <Header onMenuClick={() => setSidebarOpen(true)} />
      
      <main className="max-w-2xl mx-auto pb-safe">
        {/* Feed Tabs */}
        <FeedTabs />

        {/* Discover Sections */}
        <div className="space-y-6 py-4">
          <DiscoverSection 
            title="Trending Poets" 
            subtitle="Most loved this week"
            poets={trendingPoets.length > 0 ? trendingPoets : mockPoets.slice(0, 3)}
            type="trending"
          />
          
          <DiscoverSection 
            title="New Voices" 
            subtitle="Fresh talent to discover"
            poets={newPoets.length > 0 ? newPoets : mockPoets.slice(2, 4)}
            type="new"
          />

          {risingPoets.length > 0 && (
            <DiscoverSection 
              title="Rising Poets" 
              subtitle="Gaining momentum"
              poets={risingPoets}
              type="rising"
            />
          )}
        </div>

        {/* Divider */}
        <div className="px-4 py-4">
          <div className="h-px bg-border" />
        </div>

        {/* Poem Feed */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="px-4 space-y-4"
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Today's Poems
          </h2>
          
          <div className="space-y-4">
            {mockPoems.map((poem, index) => (
              <PoemCard key={poem.id} poem={poem} index={index} />
            ))}
          </div>
        </motion.section>

        {/* Load more indicator */}
        <div className="flex justify-center py-8">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-sm text-muted-foreground"
          >
            Scroll for more poetry...
          </motion.div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Index;

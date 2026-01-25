import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PenLine, Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { CreateButton } from '@/components/CreateButton';
import { JournalCard } from '@/components/journals/JournalCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useJournals, useMyJournals } from '@/hooks/useJournals';
import { useAuth } from '@/context/AuthProvider';

export default function PoetJournals() {
  const { user } = useAuth();
  const { data: journals = [], isLoading } = useJournals();
  const { data: myJournals = [] } = useMyJournals();
  const [activeTab, setActiveTab] = useState('all');

  // Simple algorithm: sort by engagement (likes + comments) with recency boost
  const sortedJournals = [...journals].sort((a, b) => {
    const scoreA = (a.likes_count || 0) + (a.comments_count || 0) * 2;
    const scoreB = (b.likes_count || 0) + (b.comments_count || 0) * 2;
    
    // Recency boost: journals from last 7 days get a boost
    const now = Date.now();
    const ageA = now - new Date(a.created_at).getTime();
    const ageB = now - new Date(b.created_at).getTime();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    
    const recencyBoostA = ageA < weekMs ? 10 : 0;
    const recencyBoostB = ageB < weekMs ? 10 : 0;
    
    return (scoreB + recencyBoostB) - (scoreA + recencyBoostA);
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-semibold text-foreground font-poem">
              Poet Journals
            </h1>
            {user && (
              <Button asChild size="sm" className="gap-2">
                <Link to="/journals/create">
                  <PenLine className="h-4 w-4" />
                  Write
                </Link>
              </Button>
            )}
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
            Personal stories, writing journeys, lessons learned, and reflections from poets in our community.
          </p>
        </motion.div>

        {/* Tabs */}
        {user && myJournals.length > 0 && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full max-w-xs grid-cols-2">
              <TabsTrigger value="all">All Journals</TabsTrigger>
              <TabsTrigger value="mine">My Journals</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : activeTab === 'all' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {sortedJournals.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <p className="text-muted-foreground">No journals published yet.</p>
                {user && (
                  <Button asChild variant="outline">
                    <Link to="/journals/create">Be the first to write</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {sortedJournals.map((journal, index) => (
                  <motion.div
                    key={journal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <JournalCard journal={journal} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {myJournals.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <p className="text-muted-foreground">You haven't written any journals yet.</p>
                <Button asChild variant="outline">
                  <Link to="/journals/create">Start writing</Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {myJournals.map((journal) => (
                  <JournalCard key={journal.id} journal={journal} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </main>

      <CreateButton />
    </div>
  );
}

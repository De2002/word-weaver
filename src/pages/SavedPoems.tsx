import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Bookmark, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { CreateButton } from '@/components/CreateButton';
import { useAuth } from '@/context/AuthProvider';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { useSEO } from '@/hooks/useSEO';

interface SavedPoem {
  id: string;
  title: string | null;
  poetName: string;
  poetUsername: string;
}

export default function SavedPoems() {
  useSEO({
    title: "Saved Poems",
    description: "Your collection of saved poems on WordStack."
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: savedPoems, isLoading } = useQuery({
    queryKey: ['saved-poems', user?.id],
    queryFn: async (): Promise<SavedPoem[]> => {
      if (!user?.id) return [];

      // First get saved poem IDs
      const { data: saves, error: savesError } = await db
        .from('poem_saves')
        .select('poem_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (savesError) throw savesError;
      if (!saves || saves.length === 0) return [];

      const poemIds = saves.map((s: { poem_id: string }) => s.poem_id);

      // Fetch poems
      const { data: poems, error: poemsError } = await db
        .from('poems')
        .select('id, title, user_id')
        .in('id', poemIds)
        .eq('status', 'published');

      if (poemsError) throw poemsError;
      if (!poems || poems.length === 0) return [];

      // Fetch profiles separately
      const userIds = [...new Set(poems.map((p: any) => p.user_id))];
      const { data: profiles } = await db
        .from('profiles')
        .select('user_id, display_name, username')
        .in('user_id', userIds);

      const profileMap = new Map<string, any>(
        (profiles || []).map((p: any) => [p.user_id, p])
      );

      // Sort poems by the order they were saved
      const poemMap = new Map<string, any>(poems.map((p: any) => [p.id, p]));
      return saves
        .map((s: { poem_id: string }) => {
          const p = poemMap.get(s.poem_id);
          if (!p) return null;
          const profile = profileMap.get(p.user_id);
          return {
            id: p.id,
            title: p.title,
            poetName: profile?.display_name || 'Anonymous',
            poetUsername: profile?.username || 'anonymous',
          } as SavedPoem;
        })
        .filter(Boolean) as SavedPoem[];
    },
    enabled: !!user?.id,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-2xl mx-auto px-4 pt-20 pb-24">
        {/* Back button and title */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <Bookmark className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-semibold text-foreground font-poem">
              Saved Poems
            </h1>
          </motion.div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-16 rounded-lg bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : !savedPoems || savedPoems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Bookmark className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-medium text-foreground mb-2">
              No saved poems yet
            </h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              When you save poems, they'll appear here for easy access.
            </p>
            <Link to="/discover">
              <Button>Discover Poems</Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <p className="text-sm text-muted-foreground mb-4">
              {savedPoems.length} saved poem{savedPoems.length !== 1 ? 's' : ''}
            </p>
            {savedPoems.map((poem, index) => (
              <motion.div
                key={poem.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Link
                  to={`/poem/${poem.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {poem.title || 'Untitled'}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      by {poem.poetName}
                    </p>
                  </div>
                  <Bookmark className="h-4 w-4 text-primary flex-shrink-0 ml-3" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      <CreateButton />
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Bookmark, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { CreateButton } from '@/components/CreateButton';
import { PoemCard } from '@/components/PoemCard';
import { useAuth } from '@/context/AuthProvider';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Poem } from '@/types/poem';

export default function SavedPoems() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: savedPoems, isLoading } = useQuery({
    queryKey: ['saved-poems', user?.id],
    queryFn: async (): Promise<Poem[]> => {
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

      // Then fetch the poems with their profiles
      const { data: poems, error: poemsError } = await db
        .from('poems')
        .select(`
          id,
          title,
          content,
          tags,
          created_at,
          user_id,
          profiles!inner(display_name, username, avatar_url, user_id)
        `)
        .in('id', poemIds)
        .eq('status', 'published');

      if (poemsError) throw poemsError;

      // Sort poems by the order they were saved and transform to Poem type
      const poemMap = new Map<string, any>(poems?.map((p: any) => [p.id, p]) || []);
      return saves
        .map((s: { poem_id: string }) => {
          const p = poemMap.get(s.poem_id) as any;
          if (!p) return null;
          return {
            id: p.id,
            title: p.title || undefined,
            text: p.content,
            tags: p.tags || [],
            createdAt: p.created_at,
            language: 'en',
            upvotes: 0,
            comments: 0,
            saves: 0,
            reads: 0,
            poet: {
              id: p.profiles?.user_id || p.user_id,
              name: p.profiles?.display_name || 'Anonymous',
              username: p.profiles?.username || 'anonymous',
              avatar: p.profiles?.avatar_url || '',
              bio: '',
              languages: [],
              totalReads: 0,
              totalUpvotes: 0,
              totalPoems: 0,
              followersCount: 0,
              badges: [],
            },
          } as Poem;
        })
        .filter(Boolean) as Poem[];
    },
    enabled: !!user?.id,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
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
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 rounded-xl bg-muted animate-pulse"
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
            className="space-y-4"
          >
            <p className="text-sm text-muted-foreground mb-4">
              {savedPoems.length} saved poem{savedPoems.length !== 1 ? 's' : ''}
            </p>
            {savedPoems.map((poem, index) => (
              <motion.div
                key={poem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <PoemCard poem={poem} index={index} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      <CreateButton />
      <BottomNav />
    </div>
  );
}

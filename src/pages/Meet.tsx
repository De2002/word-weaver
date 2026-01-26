import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BottomNav } from '@/components/BottomNav';
import { IntroductionCard } from '@/components/meet/IntroductionCard';
import { IntroductionForm } from '@/components/meet/IntroductionForm';
import { useIntroductions } from '@/hooks/useIntroductions';
import { useAuth } from '@/context/AuthProvider';
import { ReactionEmoji } from '@/types/introduction';
import { useSEO } from '@/hooks/useSEO';

export default function Meet() {
  useSEO({
    title: "Meet the Community",
    description: "Say hello, share your story, and welcome fellow poets. This is where connections begin."
  });
  const { user } = useAuth();
  const { 
    introductions, 
    isLoading, 
    createIntroduction, 
    toggleReaction,
    hasUserIntroduced 
  } = useIntroductions();

  const handleReact = (introductionId: string, emoji: ReactionEmoji) => {
    toggleReaction.mutate({ introductionId, emoji });
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link to="/more" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to More
          </Link>
          
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold">
              Meet the Community
            </h1>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Say hello, share your story, and welcome fellow poets. This is where connections begin.
            </p>
          </div>
        </motion.div>

        {/* Introduction Form - Only show if user hasn't introduced yet */}
        {user && !hasUserIntroduced && (
          <IntroductionForm
            onSubmit={(content) => createIntroduction.mutate(content)}
            isSubmitting={createIntroduction.isPending}
          />
        )}

        {/* Already introduced message */}
        {user && hasUserIntroduced && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 text-center"
          >
            <Sparkles className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              You've already introduced yourself! Welcome others by reacting to their introductions below.
            </p>
          </motion.div>
        )}

        {/* Login prompt */}
        {!user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-muted/50 border rounded-xl p-6 mb-6 text-center"
          >
            <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-medium mb-2">Join the conversation</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Log in to introduce yourself and welcome others
            </p>
            <Button asChild>
              <Link to="/login">Log In</Link>
            </Button>
          </motion.div>
        )}

        {/* Introductions Feed */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Recent Introductions
          </h2>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-card border rounded-xl p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </div>
          ) : introductions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-medium mb-2">No introductions yet</h3>
              <p className="text-muted-foreground text-sm">
                Be the first to say hello!
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {introductions.map((intro) => (
                <IntroductionCard
                  key={intro.id}
                  introduction={intro}
                  onReact={(emoji) => handleReact(intro.id, emoji)}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

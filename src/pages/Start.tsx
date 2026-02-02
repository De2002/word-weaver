import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Feather, Sparkles, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthProvider";
import { useSEO } from "@/hooks/useSEO";

export default function Start() {
  useSEO({
    title: "WordStack | Social Poetry Platform for Poets & Poetry Lovers",
    description: "Write and publish poems on WordStack, listen to audio poetry, follow poets, share events, message creators, and explore chapbooks.",
    fullTitle: true
  });
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between h-14 px-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-primary to-warm-gold p-1.5 rounded-lg">
              <Feather className="h-5 w-5 text-white" />
            </div>
            <span className="font-poem text-xl font-semibold text-gradient-warm">WordStack</span>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <Button asChild size="sm" variant="secondary">
                <Link to="/home">Open app</Link>
              </Button>
            ) : (
              <Button asChild size="sm" variant="secondary">
                <Link to="/login">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-10">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-10"
        >
          <h1 className="font-poem text-4xl leading-tight text-foreground">
            A home for poets.
            <span className="block text-gradient-warm">A feed readers actually linger in.</span>
          </h1>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            Share drafts, publish when you’re ready, and build a following around your voice — with optional audio readings and poet-friendly tools.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link to={user ? "/profile" : "/signup"}>Join as a poet</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/home">Browse as a reader</Link>
            </Button>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="p-2 rounded-lg bg-primary/10 w-fit">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h2 className="mt-3 font-medium">Drafts first</h2>
            <p className="mt-1 text-sm text-muted-foreground">Write privately, publish when it feels right.</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="p-2 rounded-lg bg-primary/10 w-fit">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <h2 className="mt-3 font-medium">Real growth</h2>
            <p className="mt-1 text-sm text-muted-foreground">Build momentum with discovery and trails.</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="p-2 rounded-lg bg-primary/10 w-fit">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <h2 className="mt-3 font-medium">Community</h2>
            <p className="mt-1 text-sm text-muted-foreground">Meet writers, share events, and connect.</p>
          </div>
        </motion.section>

        <div className="mt-10 text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} WordStack. All rights reserved.
        </div>
      </main>
    </div>
  );
}

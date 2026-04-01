import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles, TrendingUp, Users, Mic, BookOpen, Calendar,
  MessageCircle, HelpCircle, Feather, ArrowRight,
  BookMarked, Map
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthProvider";
import { useSEO } from "@/hooks/useSEO";

const features = [
  {
    icon: Feather,
    title: "Write & Publish",
    description: "Draft privately, publish when ready. Your words, your timeline.",
  },
  {
    icon: Mic,
    title: "Audio Readings",
    description: "Record your voice. Let readers hear your poem the way you intended.",
  },
  {
    icon: Map,
    title: "Poetry Trails",
    description: "Curated journeys through poems. Follow a theme, mood, or poet.",
  },
  {
    icon: BookMarked,
    title: "Chapbook Store",
    description: "Submit or discover independently published poetry collections.",
  },
  {
    icon: Calendar,
    title: "Events",
    description: "Open mics, workshops, and readings — online and in-person.",
  },
  {
    icon: HelpCircle,
    title: "Q&A with Poets",
    description: "Ask craft questions. Get real answers from the community.",
  },
  {
    icon: BookOpen,
    title: "Classics Library",
    description: "Read the canon. From Dickinson to Rumi, all in one place.",
  },
  {
    icon: MessageCircle,
    title: "Connect & Message",
    description: "Follow poets, meet writers, and have real conversations.",
  },
];


import type { Variants } from "framer-motion";

const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function Start() {
  useSEO({
    title: "WordStack – Publish Poems & Connect with Poets",
    description:
      "Join WordStack to read poetry, publish your poems, explore classics, ask questions, and connect with poets worldwide.",
    fullTitle: true,
  });
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between h-14 px-4 max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <img src="/favicon.png" alt="WordStack" className="h-7 w-7" />
            <span className="font-semibold text-sm tracking-wide">WordStack</span>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <Button asChild size="sm">
                <Link to="/">Open app</Link>
              </Button>
            ) : (
              <>
                <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/signup">Join free</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pb-24">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="pt-14 pb-10 text-center"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-secondary text-xs font-semibold text-muted-foreground mb-6">
            <Sparkles className="h-3 w-3 text-primary" />
            The home for serious poets
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-poem text-4xl sm:text-5xl leading-tight text-foreground"
          >
            Write poems that matter.
            <span className="block text-gradient-warm mt-1">Build an audience that lasts.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-5 text-base text-muted-foreground leading-relaxed max-w-xl mx-auto"
          >
            WordStack is a full-featured poetry platform — publish, record audio readings, join events, explore classic poetry, and connect with a community that actually reads.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-7 flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" className="gap-2 rounded-full px-7">
              <Link to={user ? "/" : "/signup"}>
                Start writing free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-7">
              <Link to="/">Browse the feed</Link>
            </Button>
          </motion.div>

          <motion.p variants={fadeUp} className="mt-4 text-xs text-muted-foreground">
            Free forever · No credit card needed
          </motion.p>
        </motion.section>

        {/* ── Feature grid ─────────────────────────────────────────────── */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mb-14"
        >
          <motion.h2 variants={fadeUp} className="text-xs font-bold uppercase tracking-widest text-muted-foreground text-center mb-6">
            Everything a poet needs
          </motion.h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-2"
              >
                <div className="p-2 rounded-lg bg-primary/10 w-fit">
                  <f.icon className="h-4 w-4 text-primary" />
                </div>
                <p className="font-semibold text-sm">{f.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Trails callout ───────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14 rounded-3xl border border-border bg-card overflow-hidden"
        >
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Featured</span>
            </div>
            <h2 className="font-poem text-2xl sm:text-3xl mb-3">Discover poems through Trails</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-lg">
              Poets and editors curate reading journeys around themes, moods, and movements. Follow a trail from start to finish and discover voices you'd never find otherwise.
            </p>
            <Button asChild variant="outline" className="rounded-full gap-2">
              <Link to="/trails">
                Explore trails <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </motion.section>

        {/* ── Community highlights ─────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <h2 className="font-poem text-2xl sm:text-3xl mb-3">A community worth joining</h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-lg mx-auto">
            From first drafts to chapbook launches — WordStack is where poetry lives online.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Publish poems", icon: Feather, href: "/signup" },
              { label: "Explore classics", icon: BookOpen, href: "/classics" },
              { label: "Find events", icon: Calendar, href: "/events" },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="rounded-2xl border border-border bg-card p-4 flex flex-col items-center gap-2 hover:bg-secondary/50 transition-colors"
              >
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs font-semibold">{item.label}</span>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* ── Final CTA ────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center py-12 rounded-3xl border border-border bg-card"
        >
          <Users className="h-8 w-8 text-primary mx-auto mb-4 opacity-80" />
          <h2 className="font-poem text-2xl sm:text-3xl mb-3">Your poems deserve an audience.</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Join thousands of poets already writing, sharing, and connecting on WordStack.
          </p>
          <Button asChild size="lg" className="rounded-full gap-2 px-8">
            <Link to={user ? "/" : "/signup"}>
              Create your poet profile
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.section>

        {/* Footer */}
        <div className="text-xs text-muted-foreground text-center flex flex-wrap justify-center gap-x-4 gap-y-1">
          <span>© {new Date().getFullYear()} WordStack</span>
          <Link to="/privacy-policy" className="hover:underline">Privacy</Link>
          <Link to="/user-agreement" className="hover:underline">Terms</Link>
          <Link to="/refund-policy" className="hover:underline">Refunds</Link>
          <Link to="/about" className="hover:underline">About</Link>
        </div>

      </main>
    </div>
  );
}

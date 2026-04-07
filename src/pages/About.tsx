import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Users, Feather, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSEO } from '@/hooks/useSEO';

export default function About() {
  useSEO({
    title: "About",
    description: "Learn how WordStack has evolved into a full creative ecosystem for poets to publish, connect, collaborate, and grow."
  });
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/feed">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-foreground">About WordStack</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex p-4 rounded-full bg-primary/10">
              <Feather className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-3xl font-bold font-poem text-foreground">
              Built for the Full Poet Journey
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              WordStack started as a place to share poems. Today, it&apos;s a living poetry ecosystem where writers publish, collaborate, learn, and build a sustainable creative practice.
            </p>
          </div>

          {/* Mission */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Our Mission
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              We believe poetry can shape culture, heal communities, and open honest conversation. Our mission is to give every poet, from first draft writers to published voices, the tools and support to create bravely and be discovered meaningfully.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Whether you write for expression, impact, or income, WordStack is designed to help your voice travel further.
            </p>
          </section>

          {/* What We Offer */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              What We Offer
            </h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span><strong className="text-foreground">Publishing That Feels Personal:</strong> Share poems, journals, and crafted collections in a space built for literary work.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span><strong className="text-foreground">Discovery with Depth:</strong> Explore tags, classics, trails, and recommendations that connect readers to the right voices.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span><strong className="text-foreground">Growth Through Community:</strong> Join challenges, discussions, and Q&A spaces that turn inspiration into momentum.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span><strong className="text-foreground">Opportunities Beyond Posting:</strong> Participate in events, submit chapbooks, and unlock new ways to earn recognition and support.</span>
              </li>
            </ul>
          </section>

          {/* Community */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Our Community
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              WordStack is now powered by readers, poets, curators, and mentors who care deeply about language and lived experience. We celebrate diverse forms, cultures, and perspectives so every writer can find both audience and belonging.
            </p>
          </section>

          {/* Contact */}
          <section className="p-6 rounded-xl bg-card border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">Get in Touch</h3>
            <p className="text-muted-foreground text-sm">
              Have ideas, partnership opportunities, or feedback on where WordStack should go next? We&apos;d love to hear from you at{' '}
              <a href="mailto:hello@wordstack.io" className="text-primary hover:underline">
                hello@wordstack.io
              </a>
            </p>
          </section>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} WordStack. All rights reserved.
          </p>
        </motion.div>
      </main>
    </div>
  );
}

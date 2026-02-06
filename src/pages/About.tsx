import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Users, Feather, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSEO } from '@/hooks/useSEO';

export default function About() {
  useSEO({
    title: "About",
    description: "Learn about WordStack, a community-driven platform dedicated to celebrating the art of poetry in all its forms."
  });
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/more">
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
              Where Words Find Their Home
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              WordStack is a community-driven platform dedicated to celebrating the art of poetry in all its forms.
            </p>
          </div>

          {/* Mission */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Our Mission
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              We believe poetry has the power to connect, heal, and inspire. Our mission is to create a welcoming space where poets of all backgrounds and experience levels can share their work, discover new voices, and be part of a supportive creative community.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Whether you're a seasoned poet or just starting your journey with words, WordStack is your home for creative expression.
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
                <span><strong className="text-foreground">A Platform for All Poets:</strong> Share your work with a community that appreciates the craft of poetry.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span><strong className="text-foreground">Discovery & Connection:</strong> Find poets whose work resonates with you and build meaningful connections.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span><strong className="text-foreground">Recognition & Growth:</strong> Get featured, earn recognition, and grow as a poet through community engagement.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span><strong className="text-foreground">Curated Experiences:</strong> Explore poetry trails, chapbooks, and themed collections.</span>
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
              WordStack is more than a platform—it's a community of passionate wordsmiths who believe in the transformative power of poetry. We celebrate diversity in voice, style, and perspective, creating a space where every poet can find their audience.
            </p>
          </section>

          {/* Contact */}
          <section className="p-6 rounded-xl bg-card border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">Get in Touch</h3>
            <p className="text-muted-foreground text-sm">
              Have questions, feedback, or just want to say hello? We'd love to hear from you at{' '}
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

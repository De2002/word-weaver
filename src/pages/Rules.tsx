import { motion } from 'framer-motion';
import { ArrowLeft, ScrollText, Check, X, AlertTriangle, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Rules() {
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
          <h1 className="text-lg font-semibold text-foreground">WordStack Rules</h1>
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
              <ScrollText className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-3xl font-bold font-poem text-foreground">
              Community Guidelines
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Our rules exist to keep WordStack a safe, welcoming, and inspiring space for all poets.
            </p>
          </div>

          {/* Core Principles */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Core Principles
            </h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span><strong className="text-foreground">Respect:</strong> Treat all community members with dignity and respect, regardless of their experience level or style.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span><strong className="text-foreground">Authenticity:</strong> Share your own original work and give credit where it's due.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span><strong className="text-foreground">Constructiveness:</strong> When engaging with others' work, be thoughtful and constructive.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span><strong className="text-foreground">Safety:</strong> Help us maintain a safe environment by reporting inappropriate content.</span>
              </li>
            </ul>
          </section>

          {/* Do's */}
          <section className="p-6 rounded-xl bg-green-500/5 border border-green-500/20 space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              What We Encourage
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-3">
                <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>Sharing original poetry in any style or form</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>Engaging positively with other poets' work</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>Using content warnings for sensitive topics</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>Building genuine connections with fellow poets</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>Reporting content that violates these guidelines</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>Supporting poets through meaningful engagement</span>
              </li>
            </ul>
          </section>

          {/* Don'ts */}
          <section className="p-6 rounded-xl bg-destructive/5 border border-destructive/20 space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <X className="h-5 w-5 text-destructive" />
              What's Not Allowed
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-3">
                <X className="h-4 w-4 text-destructive mt-1 flex-shrink-0" />
                <span>Plagiarism or claiming others' work as your own</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="h-4 w-4 text-destructive mt-1 flex-shrink-0" />
                <span>Harassment, bullying, or hate speech of any kind</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="h-4 w-4 text-destructive mt-1 flex-shrink-0" />
                <span>Spam, self-promotion abuse, or bot activity</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="h-4 w-4 text-destructive mt-1 flex-shrink-0" />
                <span>Explicit sexual content or graphic violence without warning</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="h-4 w-4 text-destructive mt-1 flex-shrink-0" />
                <span>Doxxing or sharing private information</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="h-4 w-4 text-destructive mt-1 flex-shrink-0" />
                <span>Impersonating other users or public figures</span>
              </li>
            </ul>
          </section>

          {/* Content Guidelines */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Content Guidelines
            </h3>
            <div className="space-y-3 text-muted-foreground">
              <p>
                <strong className="text-foreground">Sensitive Topics:</strong> Poetry often explores difficult themes. If your work deals with topics like mental health, violence, or mature themes, please use appropriate content warnings.
              </p>
              <p>
                <strong className="text-foreground">Original Work:</strong> Only share poetry that you have written yourself. If you're sharing a response to or inspired by another work, give proper attribution.
              </p>
              <p>
                <strong className="text-foreground">Copyright:</strong> You retain full copyright to your original work. By posting on WordStack, you grant us a license to display your content on our platform.
              </p>
            </div>
          </section>

          {/* Enforcement */}
          <section className="p-6 rounded-xl bg-card border border-border space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Enforcement</h3>
            <p className="text-muted-foreground text-sm">
              Violations of these guidelines may result in content removal, account suspension, or permanent ban depending on severity. We review all reports and take appropriate action to maintain community safety.
            </p>
            <p className="text-muted-foreground text-sm">
              If you believe your content was removed in error, you may appeal by contacting us at{' '}
              <a href="mailto:appeals@wordstack.app" className="text-primary hover:underline">
                appeals@wordstack.app
              </a>
            </p>
          </section>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </motion.div>
      </main>
    </div>
  );
}

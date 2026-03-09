import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, Crown, Star, TrendingUp, MessageSquare, Users, BarChart2, Heart, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';

const proFeatures = [
  { icon: Crown, label: 'Verified Pro badge on your profile' },
  { icon: Star, label: 'Premium author profile layout' },
  { icon: Shield, label: 'Copyright signature on every poem' },
  { icon: TrendingUp, label: 'Priority visibility & platform promotions' },
  { icon: MessageSquare, label: 'Answer questions in Q&A' },
  { icon: BarChart2, label: 'Analytics — see how your poems perform' },
  { icon: Users, label: 'See who follows you' },
  { icon: Heart, label: 'Tipping link support (Ko-fi, BMC, PayPal)' },
];

const comparison = {
  free: [
    'Standard profile',
    'Community visibility',
    'Basic posting',
    'Read & upvote poems',
  ],
  pro: [
    'Verified Pro badge',
    'Premium author layout',
    'Priority visibility',
    'Inclusion in platform promotions',
    'Eligible for Poet Pool Fund rewards',
    'Submit to platform Challenges',
    'Answer questions in Q&A',
    'Analytics access',
    'See who follows you',
    'Tipping link support (Ko-fi, BMC, PayPal)',
    'Plus future Pro features',
  ],
};

function FadeUp({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Upgrade() {
  const { roles } = useAuth();
  const isPro = roles.includes('pro');

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient gradient backdrop */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-60 blur-[100px]"
          style={{ background: 'hsl(38 80% 50% / 0.06)' }} />
      </div>

      <div className="relative max-w-2xl mx-auto px-5 pb-24 pt-16">

        {/* ── Hero ─────────────────────────────── */}
        <section className="text-center pt-8 pb-14">
          <FadeUp delay={0} className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium tracking-widest uppercase"
              style={{
                borderColor: 'hsl(38 80% 50% / 0.3)',
                background: 'hsl(38 80% 50% / 0.07)',
                color: 'hsl(38 80% 50%)',
              }}>
              <Crown className="h-3 w-3" />
              Pro Poet
            </span>
          </FadeUp>

          <FadeUp delay={0.08}>
            <h1 className="font-poem text-4xl md:text-5xl font-bold text-foreground leading-tight mb-5">
              You're Not Just Posting.
              <br />
              <span className="bg-gradient-to-r from-primary to-[hsl(38,80%,50%)] bg-clip-text text-transparent">
                You're Publishing.
              </span>
            </h1>
          </FadeUp>

          <FadeUp delay={0.16}>
            <p className="text-muted-foreground text-lg leading-relaxed mb-10 max-w-sm mx-auto">
              Upgrade to Pro and give your poetry the presence it deserves.
            </p>
          </FadeUp>

          <FadeUp delay={0.24}>
            {isPro ? (
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border font-medium"
                style={{ background: 'hsl(38 80% 50% / 0.1)', borderColor: 'hsl(38 80% 50% / 0.3)', color: 'hsl(38 80% 50%)' }}>
                <Crown className="h-4 w-4" />
                You're already a Pro Poet
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-primary-foreground font-semibold text-base shadow-lg hover:shadow-xl hover:opacity-95 transition-all duration-300"
                  style={{ background: 'linear-gradient(135deg, hsl(24 80% 50%), hsl(38 80% 50%))' }}
                >
                  <Crown className="h-4 w-4" />
                  Become a Pro Poet — $2.99/month
                </Link>
                <p className="text-muted-foreground/60 text-xs">
                  Cancel anytime. No pressure.{' '}
                  <Link to="/refund-policy" className="underline underline-offset-2 hover:text-muted-foreground transition-colors">Refund policy</Link>
                </p>
              </div>
            )}
          </FadeUp>
        </section>

        {/* ── What changes ────────────────────── */}
        <section className="mb-16">
          <FadeUp delay={0}>
            <h2 className="font-poem text-2xl font-semibold text-foreground text-center mb-2">
              As a Pro Poet, you get:
            </h2>
            <p className="text-muted-foreground text-sm text-center mb-8">
              Everything you need to be seen as the author you are.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {proFeatures.map((feat, i) => (
              <FadeUp key={feat.label} delay={i * 0.04 + 0.1}>
                <div className="flex items-start gap-3 p-4 rounded-2xl border border-border/50 bg-card hover:border-[hsl(38,80%,50%,0.3)] transition-colors duration-200 h-full">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center"
                    style={{ background: 'hsl(38 80% 50% / 0.1)' }}>
                    <feat.icon className="h-3.5 w-3.5" style={{ color: 'hsl(38 80% 50%)' }} />
                  </div>
                  <span className="text-sm text-foreground/80 leading-snug pt-1">{feat.label}</span>
                </div>
              </FadeUp>
            ))}
          </div>
        </section>

        {/* ── Visual Comparison ───────────────── */}
        <section className="mb-16">
          <FadeUp delay={0}>
            <h2 className="font-poem text-2xl font-semibold text-foreground text-center mb-2">
              Free vs Pro
            </h2>
            <p className="text-muted-foreground text-sm text-center mb-8">Not an upgrade. An evolution.</p>
          </FadeUp>

          <div className="grid grid-cols-2 gap-3">
            {/* Free */}
            <FadeUp delay={0.1}>
              <div className="rounded-2xl border border-border/60 bg-secondary/40 p-5 h-full">
                <p className="font-poem text-base font-semibold text-muted-foreground mb-4">Free Poet</p>
                <ul className="space-y-2.5">
                  {comparison.free.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1 h-3.5 w-3.5 flex-shrink-0 rounded-full border border-border flex items-center justify-center">
                        <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>

            {/* Pro */}
            <FadeUp delay={0.18}>
              <div className="rounded-2xl border p-5 relative overflow-hidden h-full"
                style={{ borderColor: 'hsl(38 80% 50% / 0.35)', background: 'linear-gradient(160deg, hsl(38 80% 50% / 0.06), transparent)' }}>
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl"
                  style={{ background: 'hsl(38 80% 50% / 0.08)' }} />
                <p className="font-poem text-base font-semibold mb-4 flex items-center gap-1.5"
                  style={{ color: 'hsl(38 80% 50%)' }}>
                  <Crown className="h-3.5 w-3.5" /> Pro Poet
                </p>
                <ul className="space-y-2.5">
                  {comparison.pro.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-foreground/80">
                      <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" style={{ color: 'hsl(38 80% 50%)' }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* ── Emotional Section ───────────────── */}
        <section className="mb-16 text-center py-10 px-6">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-border mx-auto mb-8" />

          <FadeUp delay={0}>
            <blockquote className="font-poem text-xl md:text-2xl text-foreground/60 italic leading-loose mb-6 space-y-1">
              <p>Some write for fun.</p>
              <p>Some write to be remembered.</p>
            </blockquote>
          </FadeUp>

          <FadeUp delay={0.12}>
            <p className="text-foreground/80 font-medium text-base max-w-xs mx-auto leading-relaxed">
              Pro is for poets who take their craft seriously.
            </p>
          </FadeUp>

          <div className="w-px h-12 bg-gradient-to-t from-transparent to-border mx-auto mt-8" />
        </section>

        {/* ── Final CTA ───────────────────────── */}
        {!isPro && (
          <section className="text-center pb-8">
            <FadeUp delay={0}>
              <h2 className="font-poem text-2xl font-semibold text-foreground mb-6">
                Ready to step forward?
              </h2>
            </FadeUp>

            <FadeUp delay={0.1}>
              <div className="flex flex-col items-center gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-primary-foreground font-semibold text-base shadow-lg hover:shadow-xl hover:opacity-95 transition-all duration-300"
                  style={{ background: 'linear-gradient(135deg, hsl(24 80% 50%), hsl(38 80% 50%))' }}
                >
                  <Crown className="h-4 w-4" />
                  Upgrade to Pro — $2.99/month
                </Link>
                <p className="text-muted-foreground/60 text-xs mt-1">
                  Your voice deserves more than ordinary.{' '}
                  <Link to="/refund-policy" className="underline underline-offset-2 hover:text-muted-foreground transition-colors">Refund policy</Link>
                </p>
              </div>
            </FadeUp>
          </section>
        )}
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, Crown, Star, TrendingUp, MessageSquare, Users, BarChart2, Heart, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { cn } from '@/lib/utils';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

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

export default function Upgrade() {
  const { roles } = useAuth();
  const isPro = roles.includes('pro');

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient gradient backdrop */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[hsl(var(--warm-gold)/0.06)] blur-[100px]" />
      </div>

      <div className="relative max-w-2xl mx-auto px-5 pb-24 pt-16">

        {/* ── Hero ─────────────────────────────── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="text-center pt-8 pb-14"
        >
          <motion.div
            variants={fadeUp}
            custom={0}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[hsl(var(--warm-gold)/0.3)] bg-[hsl(var(--warm-gold)/0.07)] text-[hsl(var(--warm-gold))] text-xs font-medium tracking-widest uppercase mb-6"
          >
            <Crown className="h-3 w-3" />
            Pro Poet
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="font-poem text-4xl md:text-5xl font-bold text-foreground leading-tight mb-5"
          >
            You're Not Just Posting.
            <br />
            <span className="bg-gradient-to-r from-primary to-[hsl(var(--warm-gold))] bg-clip-text text-transparent">
              You're Publishing.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="text-muted-foreground text-lg leading-relaxed mb-10 max-w-sm mx-auto"
          >
            Upgrade to Pro and give your poetry the presence it deserves.
          </motion.p>

          {isPro ? (
            <motion.div variants={fadeUp} custom={3} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[hsl(var(--warm-gold)/0.1)] border border-[hsl(var(--warm-gold)/0.3)] text-[hsl(var(--warm-gold))] font-medium">
              <Crown className="h-4 w-4" />
              You're already a Pro Poet
            </motion.div>
          ) : (
            <motion.div variants={fadeUp} custom={3} className="flex flex-col items-center gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-primary to-[hsl(var(--warm-gold))] text-primary-foreground font-semibold text-base shadow-lg hover:shadow-xl hover:opacity-95 transition-all duration-300"
              >
                <Crown className="h-4 w-4" />
                Become a Pro Poet — $2.99/month
              </Link>
              <p className="text-muted-foreground/60 text-xs">Cancel anytime. No pressure.</p>
            </motion.div>
          )}
        </motion.section>

        {/* ── What changes ────────────────────── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-16"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="font-poem text-2xl font-semibold text-foreground text-center mb-2"
          >
            As a Pro Poet, you get:
          </motion.h2>
          <p className="text-muted-foreground text-sm text-center mb-8">Everything you need to be seen as the author you are.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {proFeatures.map((feat, i) => (
              <motion.div
                key={feat.label}
                variants={fadeUp}
                custom={i * 0.05 + 1}
                className="flex items-start gap-3 p-4 rounded-2xl border border-border/50 bg-card hover:border-[hsl(var(--warm-gold)/0.3)] transition-colors duration-200"
              >
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[hsl(var(--warm-gold)/0.1)] flex items-center justify-center">
                  <feat.icon className="h-3.5 w-3.5 text-[hsl(var(--warm-gold))]" />
                </div>
                <span className="text-sm text-foreground/80 leading-snug pt-1">{feat.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Visual Comparison ───────────────── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="font-poem text-2xl font-semibold text-foreground text-center mb-2">
            Free vs Pro
          </h2>
          <p className="text-muted-foreground text-sm text-center mb-8">Not an upgrade. An evolution.</p>

          <div className="grid grid-cols-2 gap-3">
            {/* Free */}
            <div className="rounded-2xl border border-border/60 bg-secondary/40 p-5">
              <p className="font-poem text-base font-semibold text-muted-foreground mb-4">Free Poet</p>
              <ul className="space-y-2.5">
                {comparison.free.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full border border-border flex items-center justify-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="rounded-2xl border border-[hsl(var(--warm-gold)/0.35)] bg-gradient-to-b from-[hsl(var(--warm-gold)/0.06)] to-transparent p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-[hsl(var(--warm-gold)/0.08)] blur-2xl" />
              <p className="font-poem text-base font-semibold text-[hsl(var(--warm-gold))] mb-4 flex items-center gap-1.5">
                <Crown className="h-3.5 w-3.5" /> Pro Poet
              </p>
              <ul className="space-y-2.5">
                {comparison.pro.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-foreground/80">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[hsl(var(--warm-gold))]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.section>

        {/* ── Emotional Section ───────────────── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-16 text-center py-10 px-6"
        >
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-border mx-auto mb-8" />

          <blockquote className="font-poem text-xl md:text-2xl text-foreground/70 italic leading-loose mb-6 space-y-1">
            <p>Some write for fun.</p>
            <p>Some write to be remembered.</p>
          </blockquote>

          <p className="text-foreground/80 font-medium text-base max-w-xs mx-auto leading-relaxed">
            Pro is for poets who take their craft seriously.
          </p>

          <div className="w-px h-12 bg-gradient-to-t from-transparent to-border mx-auto mt-8" />
        </motion.section>

        {/* ── Final CTA ───────────────────────── */}
        {!isPro && (
          <motion.section
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center pb-8"
          >
            <h2 className="font-poem text-2xl font-semibold text-foreground mb-6">
              Ready to step forward?
            </h2>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-primary to-[hsl(var(--warm-gold))] text-primary-foreground font-semibold text-base shadow-lg hover:shadow-xl hover:opacity-95 transition-all duration-300 mb-3"
            >
              <Crown className="h-4 w-4" />
              Upgrade to Pro — $2.99/month
            </Link>

            <p className="text-muted-foreground/60 text-xs mt-3">
              Your voice deserves more than ordinary.
            </p>
          </motion.section>
        )}
      </div>
    </div>
  );
}

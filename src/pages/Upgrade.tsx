import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, Crown, Droplets, Eye } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { usePaddle, PADDLE_PRICE_IDS } from '@/hooks/usePaddle';

const observerFeatures = [
  'Read poems',
  'Discover poets',
  'Publish up to 10 poems/month',
  'No ink earnings',
  'Ad-supported',
];

const lyricFeatures = [
  'Publish up to 100 poems/month',
  'Earn from ink (locked balance)',
  'Limited ads',
];

const epicFeatures = [
  'Unlimited publishing',
  'Priority spotlight (get seen more)',
  'Withdraw your earnings',
  'Bonus ad revenue',
];

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
  const { user, roles } = useAuth();
  const isLyric = roles.includes('lyric');
  const isEpic = roles.includes('epic');
  const { openCheckout } = usePaddle();

  const currentTier = isEpic ? 'epic' : isLyric ? 'lyric' : 'observer';

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-primary/5 blur-[120px]" />
        <div
          className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-60 blur-[100px]"
          style={{ background: 'hsl(var(--warm-gold) / 0.06)' }}
        />
      </div>

      <div className="relative max-w-3xl mx-auto px-5 pb-24 pt-16">
        <section className="text-center pt-8 pb-14">
          <FadeUp delay={0.08}>
            <h1 className="font-poem text-4xl md:text-5xl font-bold text-foreground leading-tight mb-5">
              Pick the plan that fits your journey.
            </h1>
          </FadeUp>

          <FadeUp delay={0.16}>
            <p className="text-muted-foreground text-lg leading-relaxed mb-10 max-w-md mx-auto">
              Same plans and pricing as the front page: Observer, The Lyric, and The Epic.
            </p>
          </FadeUp>
        </section>

        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FadeUp delay={0.05}>
              <div className="rounded-2xl border border-border/60 bg-secondary/40 p-6 h-full flex flex-col">
                <p className="font-poem text-lg font-semibold text-muted-foreground mb-1 flex items-center gap-1.5">
                  <Eye className="h-4 w-4" /> The Observer
                </p>
                <p className="text-2xl font-bold text-foreground mb-4">Free</p>
                <ul className="space-y-2.5 flex-1">
                  {observerFeatures.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1 h-3.5 w-3.5 flex-shrink-0 rounded-full border border-border flex items-center justify-center">
                        <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                {currentTier === 'observer' && (
                  <div className="mt-6 text-center text-sm text-muted-foreground font-medium">Current plan</div>
                )}
              </div>
            </FadeUp>

            <FadeUp delay={0.12}>
              <div
                className="rounded-2xl border p-6 h-full flex flex-col relative overflow-hidden"
                style={{ borderColor: 'hsl(var(--primary) / 0.35)', background: 'linear-gradient(160deg, hsl(var(--primary) / 0.04), transparent)' }}
              >
                <p className="font-poem text-lg font-semibold text-primary mb-1 flex items-center gap-1.5">
                  <Droplets className="h-4 w-4" /> The Lyric
                </p>
                <p className="text-2xl font-bold text-foreground mb-4">$0.99<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                <ul className="space-y-2.5 flex-1">
                  {lyricFeatures.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-foreground/80">
                      <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
                {currentTier === 'lyric' ? (
                  <div className="mt-6 text-center text-sm text-primary font-medium">Your current plan</div>
                ) : currentTier === 'epic' ? (
                  <div className="mt-6 text-center text-sm text-muted-foreground">Included in your Epic plan</div>
                ) : (
                  <button
                    onClick={() => {
                      if (!user) {
                        window.location.href = '/login';
                        return;
                      }
                      openCheckout(PADDLE_PRICE_IDS.lyric, user.email ?? undefined);
                    }}
                    className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-primary-foreground font-semibold text-sm shadow-md hover:shadow-lg hover:opacity-95 transition-all duration-300 cursor-pointer bg-primary"
                  >
                    Get The Lyric — $0.99/mo
                  </button>
                )}
              </div>
            </FadeUp>

            <FadeUp delay={0.18}>
              <div
                className="rounded-2xl border p-6 h-full flex flex-col relative overflow-hidden"
                style={{ borderColor: 'hsl(var(--warm-gold) / 0.35)', background: 'linear-gradient(160deg, hsl(var(--warm-gold) / 0.06), transparent)' }}
              >
                <div
                  className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl"
                  style={{ background: 'hsl(var(--warm-gold) / 0.08)' }}
                />
                <p className="font-poem text-lg font-semibold mb-1 flex items-center gap-1.5" style={{ color: 'hsl(var(--warm-gold))' }}>
                  <Crown className="h-4 w-4" /> The Epic
                </p>
                <p className="text-2xl font-bold text-foreground mb-4">$2.99<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                <ul className="space-y-2.5 flex-1">
                  {epicFeatures.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-foreground/80">
                      <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" style={{ color: 'hsl(var(--warm-gold))' }} />
                      {item}
                    </li>
                  ))}
                </ul>
                {currentTier === 'epic' ? (
                  <div className="mt-6 text-center text-sm font-medium" style={{ color: 'hsl(var(--warm-gold))' }}>
                    Your current plan
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (!user) {
                        window.location.href = '/login';
                        return;
                      }
                      openCheckout(PADDLE_PRICE_IDS.epic, user.email ?? undefined);
                    }}
                    className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-primary-foreground font-semibold text-sm shadow-lg hover:shadow-xl hover:opacity-95 transition-all duration-300 cursor-pointer"
                    style={{ background: 'var(--gradient-warm)' }}
                  >
                    <Crown className="h-4 w-4" />
                    Get The Epic — $2.99/mo
                  </button>
                )}
              </div>
            </FadeUp>
          </div>

          <p className="text-center text-muted-foreground/60 text-xs mt-4">
            Cancel anytime. No pressure.{' '}
            <Link to="/refund-policy" className="underline underline-offset-2 hover:text-muted-foreground transition-colors">
              Refund policy
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}

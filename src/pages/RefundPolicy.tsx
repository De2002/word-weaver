import { Header } from '@/components/Header';
import { useSEO } from '@/hooks/useSEO';

export default function RefundPolicy() {
  useSEO({
    title: "Refund Policy",
    description: "WordStack Pro subscription refund policy — understand your rights and our refund terms."
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-2xl mx-auto px-4 pt-24 pb-24">
        <h1 className="text-3xl font-semibold text-foreground mb-2 font-poem">Refund Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Effective date: March 2026 · Applies to WordStack Pro subscriptions</p>

        <div className="space-y-10 text-sm leading-relaxed text-foreground/90">

          {/* Section 1 */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">1. Overview</h2>
            <p>
              WordStack offers a <strong>Pro Poet</strong> subscription that unlocks premium features including challenge participation, advanced profile customisation, and more. We want you to feel confident subscribing. This policy explains exactly when refunds are available and when they are not.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 mb-4">
              <h2 className="text-base font-semibold text-foreground mb-1">2. Initial Subscription — 24-Hour Refund Window</h2>
              <p className="text-xs text-primary font-medium mb-3 uppercase tracking-wide">First-time activation only</p>
              <p className="mb-3">
                If you have just activated a <strong>new</strong> WordStack Pro subscription, you may request a full refund within <strong>24 hours</strong> of activation. This applies only to your <strong>first-ever</strong> Pro subscription and is not available on re-subscriptions or plan changes.
              </p>
              <p className="font-medium text-foreground">Eligible reasons for a refund within this window include:</p>
              <ul className="mt-2 space-y-1.5 list-none">
                {[
                  "You subscribed by mistake or unintentionally.",
                  "The Pro features do not work as described on your device.",
                  "You experienced a technical issue that prevented access to Pro features.",
                  "You were charged more than the advertised amount.",
                  "Duplicate charges or billing errors.",
                ].map((reason, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">{i + 1}</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-muted-foreground text-xs">
              Refund requests must be submitted within 24 hours of the charge appearing on your account. Requests submitted after this window will not be considered for initial subscriptions.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <div className="rounded-xl border border-border bg-muted/30 p-5">
              <h2 className="text-base font-semibold text-foreground mb-1">3. Recurring Subscriptions — No Refunds</h2>
              <p className="text-xs text-muted-foreground font-medium mb-3 uppercase tracking-wide">Monthly / annual renewals</p>
              <p>
                Once your subscription renews — whether monthly or annually — <strong>no refunds will be issued</strong> for that billing period. Each renewal gives you immediate continued access to all Pro features for the duration of the paid period.
              </p>
              <p className="mt-3">
                If you no longer wish to continue, you can cancel at any time (see Section 4). Cancellation stops future charges but does not entitle you to a refund of the current period already paid.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">4. Cancellation</h2>
            <p className="mb-3">
              You may cancel your Pro subscription at any time from your account settings. Cancellation takes effect at the <strong>end of your current billing cycle</strong> — meaning:
            </p>
            <ul className="space-y-2 list-none">
              {[
                "You will not be charged for the next billing period.",
                "You retain access to Pro features until your current period expires.",
                "No partial refunds are given for unused days in a current period.",
              ].map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-foreground/90">
                  <span className="text-primary mt-0.5">→</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-muted-foreground">
              Cancellation does not delete your account or your published poetry. Your profile reverts to the standard plan once the paid period ends.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">5. How to Request a Refund</h2>
            <p className="mb-3">To request a refund within the eligible 24-hour window, contact us with:</p>
            <ul className="space-y-1.5 list-none">
              {[
                "Your registered email address.",
                "The date and time of your subscription activation.",
                "The reason for your refund request.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-muted-foreground">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4">
              Approved refunds are processed within <strong>5–10 business days</strong> depending on your payment provider. We will notify you by email once the refund has been initiated.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">6. Changes to This Policy</h2>
            <p>
              WordStack reserves the right to update this Refund Policy at any time. Material changes will be communicated via the platform or email. Continued use of the Pro subscription after changes constitutes acceptance of the revised policy.
            </p>
          </section>

          {/* Summary box */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick Summary</p>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-lg">✅</span>
                <div>
                  <p className="font-medium text-foreground">First subscription</p>
                  <p className="text-muted-foreground">Full refund within 24 hours of activation for valid reasons.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">❌</span>
                <div>
                  <p className="font-medium text-foreground">Renewals</p>
                  <p className="text-muted-foreground">No refunds on any recurring billing period.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">🔕</span>
                <div>
                  <p className="font-medium text-foreground">Cancellation</p>
                  <p className="text-muted-foreground">Stops future charges. Access continues until end of paid period.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} WordStack. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}

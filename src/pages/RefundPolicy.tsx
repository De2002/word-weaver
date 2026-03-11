import { Header } from '@/components/Header';
import { useSEO } from '@/hooks/useSEO';

export default function RefundPolicy() {
  useSEO({
    title: "Refund Policy",
    description: "WordStack Pro subscription refund policy — powered by Paddle as Merchant of Record."
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
            <h2 className="text-base font-semibold text-foreground mb-3">1. Merchant of Record</h2>
            <p>
              WordStack Pro subscriptions are sold and processed by <strong>Paddle</strong> (Paddle.com Market Ltd / Paddle.com Inc), who acts as the Merchant of Record and authorised reseller. This means you purchase the subscription <em>from Paddle</em>, but the product is licensed to you by WordStack. Your purchase is therefore governed by both this policy and{' '}
              <a
                href="https://www.paddle.com/legal/invoiced-consumer-terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                Paddle's Consumer Terms
              </a>.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 mb-4">
              <h2 className="text-base font-semibold text-foreground mb-1">2. Right to Cancel — 14-Day Window</h2>
              <p className="text-xs text-primary font-medium mb-3 uppercase tracking-wide">Consumers · First-time activation</p>
              <p className="mb-3">
                If you are a Consumer, you have the right to cancel your <strong>new</strong> WordStack Pro subscription and receive a full refund within <strong>14 days</strong> of activation, without giving any reason. This right applies only to your <strong>initial subscription</strong> and not to subsequent automatic renewals.
              </p>
              <p className="font-medium text-foreground">The 14-day cancellation right does not apply if:</p>
              <ul className="mt-2 space-y-1.5 list-none">
                {[
                  "You have already begun downloading, streaming or otherwise acquiring Digital Content and explicitly consented to immediate performance, losing the right of withdrawal.",
                  "The subscription has already renewed (renewals are not eligible — see Section 3).",
                ].map((reason, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">{i + 1}</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-muted-foreground text-xs">
              To exercise your cancellation right, contact us within 14 days of activation with your registered email address, activation date and reason. Reimbursement will be made within 14 days via your original payment method, with no fees charged.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <div className="rounded-xl border border-border bg-muted/30 p-5">
              <h2 className="text-base font-semibold text-foreground mb-1">3. Recurring Renewals — No Refunds</h2>
              <p className="text-xs text-muted-foreground font-medium mb-3 uppercase tracking-wide">Monthly / annual automatic renewals</p>
              <p>
                Once your subscription renews automatically, <strong>there are no refunds</strong> on the unused portion of that billing period. Each renewal grants you immediate continued access to all Pro features for the full period paid.
              </p>
              <p className="mt-3">
                You can cancel at any time to stop future renewals (see Section 4). Cancellation does not entitle you to a refund of the current period already charged.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">4. Cancellation</h2>
            <p className="mb-3">
              You may cancel your Pro subscription at any time from your account settings, or by contacting us. Cancellation must be made at least <strong>48 hours before</strong> the end of your current billing period to take effect on the next renewal date.
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
              Cancellation does not delete your account or published poetry. Your profile reverts to the standard plan once the paid period ends.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">5. Paddle's Discretionary Refunds</h2>
            <p className="mb-3">
              Outside the statutory 14-day window, refunds may be issued at the sole discretion of Paddle on a case-by-case basis. Paddle reserves the right to refuse a refund request if there is evidence of fraud, refund abuse or other manipulative behaviour. This does not affect your statutory rights as a Consumer where a product is not as described, faulty or not fit for purpose.
            </p>
            <p>
              For all refund and billing queries handled by Paddle, please visit{' '}
              <a
                href="https://paddle.net/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                paddle.net
              </a>.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">6. How to Request a Refund</h2>
            <p className="mb-3">To request a cancellation or refund within the 14-day window, contact us with:</p>
            <ul className="space-y-1.5 list-none">
              {[
                "Your registered email address.",
                "The date and time of your subscription activation.",
                "Your Paddle order reference (found in your receipt email).",
                "The reason for your request.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-muted-foreground">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4">
              Approved refunds are processed by Paddle within <strong>14 days</strong> via your original payment method with no additional fees.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">7. Changes to This Policy</h2>
            <p>
              WordStack reserves the right to update this Refund Policy at any time. Material changes will be communicated via the platform or email. Continued use of the Pro subscription after changes constitutes acceptance of the revised policy. This policy is subject to and supplemented by{' '}
              <a
                href="https://www.paddle.com/legal/invoiced-consumer-terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                Paddle's Consumer Terms
              </a>.
            </p>
          </section>

          {/* Summary box */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick Summary</p>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-lg">✅</span>
                <div>
                  <p className="font-medium text-foreground">First subscription — 14-day window</p>
                  <p className="text-muted-foreground">Full refund within 14 days of activation (Consumer right). Exceptions apply for immediately-accessed digital content.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">❌</span>
                <div>
                  <p className="font-medium text-foreground">Renewals</p>
                  <p className="text-muted-foreground">No refunds on any automatic renewal billing period.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">🔕</span>
                <div>
                  <p className="font-medium text-foreground">Cancellation</p>
                  <p className="text-muted-foreground">Cancel 48 hrs before renewal. Access continues until end of paid period.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">⚖️</span>
                <div>
                  <p className="font-medium text-foreground">Processed by Paddle</p>
                  <p className="text-muted-foreground">All billing and refunds are handled by Paddle as Merchant of Record.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} WordStack. All rights reserved. · Payments processed by{' '}
            <a
              href="https://www.paddle.com/legal/invoiced-consumer-terms"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:opacity-80 transition-opacity"
            >
              Paddle
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

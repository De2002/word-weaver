import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthProvider";
import { useSEO } from "@/hooks/useSEO";
import { usePaddle, PADDLE_PRICE_IDS } from "@/hooks/usePaddle";

const pricingTiers = [
  {
    name: "The Observer",
    price: "Free",
    description: "Perfect if you just want to explore.",
    perks: ["Read poems", "Discover poets", "Ad-supported"],
    cta: "Keep Reading",
    priceId: null,
  },
  {
    name: "The Lyric",
    price: "$0.99/mo",
    description: "Start sharing your voice.",
    perks: ["Publish up to 100 poems/month", "Earn from ink (locked balance)", "Limited ads"],
    cta: "Get Started",
    featured: true,
    priceId: PADDLE_PRICE_IDS.lyric,
  },
  {
    name: "The Epic",
    price: "$2.99/mo",
    description: "For poets ready to grow.",
    perks: ["Unlimited publishing", "Priority spotlight (get seen more)", "Withdraw your earnings", "Bonus ad revenue"],
    cta: "Go Professional",
    priceId: PADDLE_PRICE_IDS.epic,
  },
];

export default function Start() {
  useSEO({
    title: "Wordstack Poetry Platform – Publish & Earn",
    description:
      "Publish your poems on Wordstack, connect with readers, and start earning from your writing today.",
    fullTitle: true,
  });

  const { user } = useAuth();
  const { openCheckout } = usePaddle();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/60">
        <div className="flex items-center justify-between h-14 px-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-xs font-semibold text-primary">
              WS
            </span>
            <span className="font-semibold text-sm tracking-wide">WordStack</span>
          </div>
          {user ? (
            <Button asChild size="sm">
              <Link to="/feed">Open app</Link>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/signup">Join free</Link>
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pb-24">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-16 pb-12"
        >
          <h1 className="font-poem text-4xl sm:text-5xl text-foreground leading-tight">
            Earn from your poems.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Get monthly support ink, enter contests, and earn as your work grows.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-full px-8 gap-2">
              <Link to={user ? "/create/poetry" : "/signup"}>
                Start Writing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8">
              <Link to="/feed">Explore Poems</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">Join poets already sharing their voice.</p>
        </motion.section>

        <section className="py-10 border-t border-border/70">
          <h2 className="font-poem text-2xl sm:text-3xl mb-4">This Isn’t Just Another Poetry Platform</h2>
          <p className="text-muted-foreground leading-relaxed max-w-3xl">
            Most places give you likes. We give you <em>ink</em>. Ink is how readers support poems that truly move
            them. It’s not noise. It’s not random. It’s real backing from real people.
          </p>
          <p className="text-muted-foreground leading-relaxed max-w-3xl mt-3">
            When someone pours ink on your poem… they’re saying <em>“this meant something to me.”</em>
          </p>
        </section>

        <section className="py-10 border-t border-border/70">
          <h2 className="font-poem text-2xl sm:text-3xl mb-5">Simple. Honest. Powerful.</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Publish Your Poetry",
                text: "Share your thoughts, your feelings, your story.",
              },
              {
                step: "2",
                title: "Receive Ink",
                text: "Readers support your work when it resonates.",
              },
              {
                step: "3",
                title: "Grow & Earn",
                text: "Build your audience and unlock real earnings.",
              },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border border-border bg-card p-5">
                <p className="text-xs font-bold tracking-widest text-primary mb-2">STEP {item.step}</p>
                <h3 className="font-semibold text-foreground mb-1.5">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-10 border-t border-border/70">
          <h2 className="font-poem text-2xl sm:text-3xl mb-4">A Space That Actually Supports You</h2>
          <p className="text-muted-foreground max-w-3xl leading-relaxed">
            No pressure. No hate. No fighting for attention. Just poets reading poets. Supporting each other. Growing
            together.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-foreground">
            <li>• Follow voices you love</li>
            <li>• Discover new poets every day</li>
            <li>• Pour ink on words that hit deep</li>
          </ul>
          <p className="text-muted-foreground mt-4 italic">This is a space where people want you to win.</p>
        </section>

        <section className="py-10 border-t border-border/70">
          <h2 className="font-poem text-2xl sm:text-3xl mb-4">Your Words Can Pay You Back</h2>
          <p className="text-muted-foreground leading-relaxed max-w-3xl">
            When readers support your poetry with ink, you don’t just feel it—you earn from it. Start small. Grow
            naturally. Upgrade when you’re ready.
          </p>
        </section>

        <section className="py-10 border-t border-border/70">
          <h2 className="font-poem text-2xl sm:text-3xl mb-5">Choose Your Path</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {pricingTiers.map((tier) => (
              <article
                key={tier.name}
                className={`rounded-2xl border p-5 ${tier.featured ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`}
              >
                <h3 className="font-semibold text-lg">{tier.name}</h3>
                <p className="text-primary font-semibold mt-1">{tier.price}</p>
                <p className="text-sm text-muted-foreground mt-2">{tier.description}</p>
                <ul className="mt-4 space-y-1.5 text-sm text-foreground">
                  {tier.perks.map((perk) => (
                    <li key={perk}>• {perk}</li>
                  ))}
                </ul>
                {tier.priceId ? (
                  <Button
                    variant={tier.featured ? "default" : "outline"}
                    className="mt-5 w-full"
                    onClick={() => {
                      if (!user) {
                        window.location.href = "/signup";
                        return;
                      }
                      openCheckout(tier.priceId!, user.email ?? undefined);
                    }}
                  >
                    {tier.cta}
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="mt-5 w-full">
                    <Link to={user ? "/feed" : "/signup"}>{tier.cta}</Link>
                  </Button>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="py-10 border-t border-border/70">
          <h2 className="font-poem text-2xl sm:text-3xl mb-4">Not Sure If You’re “Good Enough”?</h2>
          <p className="text-muted-foreground max-w-3xl leading-relaxed">
            You don’t need to be perfect. You don’t need a big audience. If you write… you belong here.
          </p>
        </section>

        <section className="mt-4 text-center py-12 rounded-3xl border border-border bg-card">
          <h2 className="font-poem text-3xl mb-3">Start Sharing Your Poetry Today</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Your words are already inside you. This is where they get seen.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-full px-8">
              <Link to={user ? "/create/poetry" : "/signup"}>Write Your First Poem</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8">
              <Link to={user ? "/feed" : "/signup"}>Join the Community</Link>
            </Button>
          </div>
        </section>

        <p className="text-center text-sm text-muted-foreground mt-8 italic">Write. Share. Be Felt.</p>
      </main>
    </div>
  );
}

import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

const GAMES = [
  { emoji: "🎰", name: "Slots", desc: "5-reel slots with 9 paylines and epic multipliers", href: "/games/slots" },
  { emoji: "🃏", name: "Blackjack", desc: "Beat the dealer to 21. Blackjack pays 3:2", href: "/games/blackjack" },
  { emoji: "♣️", name: "Video Poker", desc: "Jacks or Better — hold your best cards and draw", href: "/games/poker" },
  { emoji: "🎡", name: "Roulette", desc: "European wheel with straight-up and outside bets", href: "/games/roulette" },
];

const HOW_IT_WORKS = [
  { step: "1", title: "Sign up free", desc: "Create your account and receive 10,000 Gold Coins + 2 Sweeps Coins instantly." },
  { step: "2", title: "Play games", desc: "Use Gold Coins for fun or Sweeps Coins for a chance to win prizes." },
  { step: "3", title: "Earn daily bonuses", desc: "Log in every day to collect 1,000 GC + 0.50 SC — no purchase needed." },
  { step: "4", title: "Redeem for prizes", desc: "Sweeps Coins can be redeemed for gift cards and prizes." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-casino-900 text-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-casino-700 bg-casino-900/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button variant="gold" size="sm">Play Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-dots py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-casino-950 via-casino-900 to-casino-900" />
        <div className="absolute top-1/3 left-1/4 h-96 w-96 rounded-full bg-gold-400/5 blur-3xl" />
        <div className="absolute top-1/4 right-1/4 h-80 w-80 rounded-full bg-gold-600/5 blur-3xl" />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-400 text-sm font-medium mb-6">
            🎉 No Purchase Necessary · Sweepstakes Model
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight tracking-tight text-glow-gold mb-6">
            Play Free.<br />
            <span className="text-gold-400">Win Real Prizes.</span>
          </h1>
          <p className="text-xl text-white/60 max-w-xl mx-auto mb-10">
            The most exciting sweepstakes casino. Spin, deal, and bet with Gold Coins for fun — or earn Sweeps Coins you can redeem for prizes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/signup">
              <Button variant="gold" size="xl" className="rounded-full px-10 shadow-gold-glow-lg">
                Claim 10,000 Free Coins →
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="xl" className="rounded-full px-10">
                Sign In
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-white/30">
            Free to play. No purchase necessary. Void where prohibited.
          </p>
        </div>
      </section>

      {/* Games */}
      <section className="py-20 px-6 border-t border-casino-700">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-3">Your Games</h2>
          <p className="text-white/50 text-center mb-12">Four iconic casino games, completely free to play</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {GAMES.map((g) => (
              <div
                key={g.name}
                className="glass rounded-2xl p-6 flex flex-col gap-3 hover:border-gold-400/30 transition-all group"
              >
                <div className="text-5xl group-hover:scale-110 transition-transform">{g.emoji}</div>
                <div className="font-display text-xl font-semibold text-gold-400">{g.name}</div>
                <p className="text-sm text-white/50 flex-1">{g.desc}</p>
                <Link href="/signup">
                  <Button variant="outline" size="sm" className="w-full group-hover:border-gold-400/40">
                    Play Now
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 border-t border-casino-700 bg-casino-800/40">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-gold text-casino-900 font-bold flex items-center justify-center shrink-0 shadow-gold-glow text-sm">
                  {item.step}
                </div>
                <div>
                  <div className="font-semibold text-white mb-1">{item.title}</div>
                  <div className="text-sm text-white/50">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Currency explainer */}
      <section className="py-20 px-6 border-t border-casino-700">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-12">Two Currencies, Endless Fun</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-6 border-gold-400/20">
              <div className="text-4xl mb-4">🪙</div>
              <div className="font-display text-2xl font-semibold text-gold-400 mb-2">Gold Coins</div>
              <ul className="space-y-2 text-sm text-white/60">
                <li>✓ Used for fun play only</li>
                <li>✓ No cash value</li>
                <li>✓ 10,000 free on signup</li>
                <li>✓ 1,000 free every day</li>
                <li>✓ Win more GC in games</li>
              </ul>
            </div>
            <div className="glass rounded-2xl p-6 border border-win/20">
              <div className="text-4xl mb-4">💎</div>
              <div className="font-display text-2xl font-semibold text-win mb-2">Sweeps Coins</div>
              <ul className="space-y-2 text-sm text-white/60">
                <li>✓ Earnable at no cost</li>
                <li>✓ 2.00 SC free on signup</li>
                <li>✓ 0.50 SC free every day</li>
                <li>✓ Play casino games</li>
                <li>✓ Redeem for gift cards & prizes</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-casino-700 bg-casino-800/40">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-display text-4xl font-bold mb-4">Ready to play?</h2>
          <p className="text-white/50 mb-8">Join free and spin your way to glory — no deposit, no risk.</p>
          <Link href="/signup">
            <Button variant="gold" size="xl" className="rounded-full px-12 shadow-gold-glow-lg">
              Start Playing Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-casino-700 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo />
          <p className="text-xs text-white/30 max-w-md text-center md:text-right">
            SunshineSpins is a sweepstakes casino. No purchase necessary. Sweeps Coins have no cash value until redeemed. Must be 18+. Void where prohibited by law.
          </p>
        </div>
      </footer>
    </div>
  );
}

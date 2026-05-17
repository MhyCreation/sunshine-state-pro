import { Logo } from "@/components/ui/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-casino-900">
      {/* Left panel */}
      <div className="hidden md:flex bg-casino-800 border-r border-casino-600 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-60" />
        <div className="absolute top-1/2 -right-20 h-96 w-96 rounded-full bg-gold-400/8 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 h-64 w-64 rounded-full bg-gold-600/6 blur-2xl" />

        <div className="relative">
          <Logo />
        </div>

        <div className="relative space-y-8">
          {/* Fake game preview */}
          <div className="flex gap-2 text-5xl select-none">
            {["🍒", "💎", "⭐", "7️⃣", "🔔"].map((emoji, i) => (
              <div
                key={i}
                className="w-14 h-14 rounded-xl bg-casino-700 border border-casino-500 flex items-center justify-center animate-float"
                style={{ animationDelay: `${i * 0.3}s` }}
              >
                {emoji}
              </div>
            ))}
          </div>

          <div>
            <div className="font-display text-3xl font-semibold leading-snug mb-4">
              Your{" "}
              <span className="text-gold-400 text-glow-gold">10,000 Gold Coins</span>{" "}
              are waiting.
            </div>
            <p className="text-white/50 text-sm">
              Free sweepstakes casino. No purchase necessary.
              Play slots, blackjack, poker, and roulette instantly.
            </p>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-casino-700/50 border border-casino-600">
            <div className="text-2xl">💎</div>
            <div className="text-sm">
              <div className="font-medium text-white">2.00 Sweeps Coins</div>
              <div className="text-white/40 text-xs">Free on signup — redeemable for prizes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}

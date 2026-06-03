import Link from "next/link";
import { ALL_SLOTS } from "@/components/games/slots/slot-configs";

const LUCKY_SPINS = {
  id: "lucky-spins",
  name: "Lucky Spins",
  subtitle: "Classic 9-Payline Slots",
  tagline: "The original one-armed bandit",
  emoji: "🎰",
  rtp: "95.0%",
  maxWin: "2,500×",
  lineCount: 9,
  theme: {
    headerGradient: "from-casino-900 via-casino-800 to-casino-900",
    accentText: "text-gold-400",
  },
  bonus: {
    name: "Wild Multiplier",
    description: "Wilds substitute for all symbols and double your win",
  },
};

const ALL_GAMES = [LUCKY_SPINS, ...ALL_SLOTS];

export default function SlotsGalleryPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">🎰 Slot Machines</h1>
        <p className="text-white/50 text-sm mt-1">
          {ALL_GAMES.length} machines · Gold Coins &amp; Sweeps Coins
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ALL_GAMES.map((slot) => (
          <Link key={slot.id} href={`/games/slots/${slot.id}`} className="group block">
            <div className="rounded-xl border border-casino-600 bg-casino-800 overflow-hidden hover:border-gold-400/50 transition-all duration-200 hover:shadow-gold group-hover:-translate-y-0.5">
              {/* Header */}
              <div className={`bg-gradient-to-r ${slot.theme.headerGradient} px-5 py-6 flex items-center justify-between`}>
                <span className="text-5xl">{slot.emoji}</span>
                <div className="text-right">
                  <div className="text-xs text-white/50 font-medium uppercase tracking-wider">Max Win</div>
                  <div className="text-xl font-bold text-gold-400">{slot.maxWin}</div>
                </div>
              </div>

              {/* Body */}
              <div className="px-5 py-4 space-y-3">
                <div>
                  <h3 className="font-display font-bold text-white text-lg leading-tight">{slot.name}</h3>
                  <p className={`text-sm font-medium ${slot.theme.accentText}`}>{slot.subtitle}</p>
                  <p className="text-xs text-white/40 mt-0.5 italic">&ldquo;{slot.tagline}&rdquo;</p>
                </div>

                <div className="flex items-center justify-between text-xs text-white/50">
                  <span>{slot.lineCount} lines</span>
                  <span className="text-white/30">·</span>
                  <span>RTP {slot.rtp}</span>
                </div>

                <div className="rounded-lg bg-casino-700/60 border border-casino-600/50 px-3 py-2">
                  <div className="text-[10px] uppercase tracking-wider text-white/30 mb-0.5">Bonus Feature</div>
                  <div className="text-xs text-white/70 font-medium">{slot.bonus.name}</div>
                  <div className="text-[11px] text-white/40 leading-snug mt-0.5">{slot.bonus.description}</div>
                </div>

                <div className="pt-1">
                  <div className="w-full rounded-md bg-gold-400/10 border border-gold-400/30 py-2 text-center text-sm font-semibold text-gold-400 group-hover:bg-gold-400/20 transition-colors">
                    Play Now →
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

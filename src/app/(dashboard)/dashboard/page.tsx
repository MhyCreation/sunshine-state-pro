import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DailyBonusButton } from "@/components/casino/daily-bonus-button";

const GAMES = [
  {
    href: "/games/slots",
    emoji: "🎰",
    name: "Lucky Spins",
    subtitle: "Slots",
    desc: "5 reels · 9 paylines · Wild bonus",
    rtp: "96%",
    hot: true,
  },
  {
    href: "/games/blackjack",
    emoji: "🃏",
    name: "21 Royale",
    subtitle: "Blackjack",
    desc: "Beat the dealer · Blackjack 3:2",
    rtp: "99.5%",
    hot: false,
  },
  {
    href: "/games/poker",
    emoji: "♣️",
    name: "Jacks or Better",
    subtitle: "Video Poker",
    desc: "5-card draw · Royal Flush 800×",
    rtp: "99.5%",
    hot: false,
  },
  {
    href: "/games/roulette",
    emoji: "🎡",
    name: "Grand Roulette",
    subtitle: "Roulette",
    desc: "European wheel · 37 numbers",
    rtp: "97.3%",
    hot: false,
  },
];

export default async function LobbyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: wallet } = await supabase
    .from("wallets")
    .select("gold_coins, sweeps_coins, lifetime_gc_won, lifetime_sc_won")
    .eq("user_id", user!.id)
    .single();

  const { data: recentSessions } = await supabase
    .from("game_sessions")
    .select("game, currency, bet_amount, win_amount, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const today = new Date().toISOString().split("T")[0];
  const { data: dailyClaimed } = await supabase
    .from("daily_bonuses")
    .select("id")
    .eq("user_id", user!.id)
    .eq("claimed_date", today)
    .maybeSingle();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Casino Lobby</h1>
          <p className="text-white/50 text-sm mt-1">Choose your game and start playing</p>
        </div>
        <DailyBonusButton alreadyClaimed={!!dailyClaimed} />
      </div>

      {/* Wallet KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "GC Balance", value: `🪙 ${(wallet?.gold_coins ?? 0).toLocaleString()}` },
          { label: "SC Balance", value: `💎 ${parseFloat(String(wallet?.sweeps_coins ?? "0")).toFixed(2)}` },
          { label: "Lifetime GC Won", value: (wallet?.lifetime_gc_won ?? 0).toLocaleString() },
          { label: "Lifetime SC Won", value: parseFloat(String(wallet?.lifetime_sc_won ?? "0")).toFixed(2) },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-casino-800 rounded-xl border border-casino-600 p-4 card-shine">
            <div className="text-2xl font-bold text-white font-mono">{kpi.value}</div>
            <div className="text-white/40 text-xs mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Games grid */}
      <div>
        <h2 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-4">Games</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {GAMES.map((game) => (
            <Link key={game.href} href={game.href} className="block group">
              <div className="bg-casino-800 rounded-2xl border border-casino-600 p-5 hover:border-gold-400/40 transition-all hover:shadow-gold-glow group-hover:bg-casino-700 h-full flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="text-4xl group-hover:scale-110 transition-transform">{game.emoji}</div>
                  {game.hot && (
                    <span className="text-[10px] bg-gold-400/20 text-gold-400 border border-gold-400/30 rounded-full px-2 py-0.5 font-medium">
                      HOT
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-display text-lg font-semibold text-white group-hover:text-gold-400 transition-colors">
                    {game.name}
                  </div>
                  <div className="text-white/40 text-xs mb-1">{game.subtitle}</div>
                  <div className="text-white/60 text-xs">{game.desc}</div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/30">RTP: {game.rtp}</span>
                  <span className="text-gold-400 group-hover:translate-x-0.5 transition-transform">Play →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      {recentSessions && recentSessions.length > 0 && (
        <div>
          <h2 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-4">Recent Games</h2>
          <div className="bg-casino-800 rounded-xl border border-casino-600 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-casino-600">
                  <th className="text-left text-white/40 text-xs font-medium px-4 py-3">Game</th>
                  <th className="text-left text-white/40 text-xs font-medium px-4 py-3">Currency</th>
                  <th className="text-right text-white/40 text-xs font-medium px-4 py-3">Bet</th>
                  <th className="text-right text-white/40 text-xs font-medium px-4 py-3">Result</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((s, i) => {
                  const net = parseFloat(String(s.win_amount)) - parseFloat(String(s.bet_amount));
                  return (
                    <tr key={i} className="border-b border-casino-700 last:border-0">
                      <td className="px-4 py-3 text-white capitalize">{s.game}</td>
                      <td className="px-4 py-3 text-white/50 uppercase text-xs">{s.currency}</td>
                      <td className="px-4 py-3 text-right text-white/60 font-mono text-xs">
                        {s.currency === "gold"
                          ? parseFloat(String(s.bet_amount)).toLocaleString()
                          : parseFloat(String(s.bet_amount)).toFixed(2)}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono text-xs font-medium ${net > 0 ? "text-win" : net < 0 ? "text-lose" : "text-white/40"}`}>
                        {net > 0 ? "+" : ""}
                        {s.currency === "gold" ? net.toLocaleString() : net.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

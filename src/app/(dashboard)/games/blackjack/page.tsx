import { BlackjackTable } from "@/components/games/blackjack-table";

export default function BlackjackPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">🃏 21 Royale</h1>
        <p className="text-white/50 text-sm mt-1">Beat the dealer to 21 · Blackjack pays 3:2</p>
      </div>
      <BlackjackTable />
    </div>
  );
}

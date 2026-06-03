import { CoinflipTable } from "@/components/games/coinflip-table";
export default function CoinflipPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">🪙 Coin Flip</h1>
        <p className="text-white/50 text-sm mt-1">Heads or Tails · Keep flipping to multiply · Cash out anytime</p>
      </div>
      <CoinflipTable />
    </div>
  );
}

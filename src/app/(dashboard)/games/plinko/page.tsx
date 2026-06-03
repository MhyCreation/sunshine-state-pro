import { PlinkoTable } from "@/components/games/plinko-table";
export default function PlinkoPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">🎱 Plinko</h1>
        <p className="text-white/50 text-sm mt-1">Drop the ball · Bounce through pegs · Land in a multiplier bucket</p>
      </div>
      <PlinkoTable />
    </div>
  );
}

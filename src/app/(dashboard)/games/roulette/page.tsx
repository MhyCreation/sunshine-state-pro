import { RouletteTable } from "@/components/games/roulette-table";

export default function RoulettePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">🎡 Grand Roulette</h1>
        <p className="text-white/50 text-sm mt-1">European wheel · 37 numbers · Straight-up 35:1</p>
      </div>
      <RouletteTable />
    </div>
  );
}

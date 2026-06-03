import { HiLoTable } from "@/components/games/hilo-table";
export default function HiLoPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">🃏 Hi-Lo</h1>
        <p className="text-white/50 text-sm mt-1">Guess higher or lower · Multiplier grows with each win · Collect anytime</p>
      </div>
      <HiLoTable />
    </div>
  );
}

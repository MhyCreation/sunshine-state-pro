import { WheelTable } from "@/components/games/wheel-table";
export default function WheelPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">🎡 Fortune Wheel</h1>
        <p className="text-white/50 text-sm mt-1">Spin to win · 2× · 5× · 10× multipliers</p>
      </div>
      <WheelTable />
    </div>
  );
}

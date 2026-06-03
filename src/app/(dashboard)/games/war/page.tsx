import { WarTable } from "@/components/games/war-table";
export default function WarPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">⚔️ War</h1>
        <p className="text-white/50 text-sm mt-1">One card each · Higher wins · Ace beats all · Tie = push</p>
      </div>
      <WarTable />
    </div>
  );
}

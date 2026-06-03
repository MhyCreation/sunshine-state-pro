import { KenoTable } from "@/components/games/keno-table";

export default function KenoPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">🎱 Keno</h1>
        <p className="text-white/50 text-sm mt-1">Pick up to 10 numbers · 20 drawn · Big multipliers</p>
      </div>
      <KenoTable />
    </div>
  );
}

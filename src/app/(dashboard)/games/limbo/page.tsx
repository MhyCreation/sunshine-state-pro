import { LimboTable } from "@/components/games/limbo-table";
export default function LimboPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">🚀 Limbo</h1>
        <p className="text-white/50 text-sm mt-1">Set your target multiplier · Win if the result hits it</p>
      </div>
      <LimboTable />
    </div>
  );
}

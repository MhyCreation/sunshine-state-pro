import { CrashTable } from "@/components/games/crash-table";

export default function CrashPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">🚀 Crash</h1>
        <p className="text-white/50 text-sm mt-1">Cash out before it crashes · Multiplier grows in real-time</p>
      </div>
      <CrashTable />
    </div>
  );
}

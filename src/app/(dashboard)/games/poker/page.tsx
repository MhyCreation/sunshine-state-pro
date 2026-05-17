import { PokerTable } from "@/components/games/poker-table";

export default function PokerPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">♣️ Jacks or Better</h1>
        <p className="text-white/50 text-sm mt-1">Video poker · Hold your best cards · Royal Flush pays 800×</p>
      </div>
      <PokerTable />
    </div>
  );
}

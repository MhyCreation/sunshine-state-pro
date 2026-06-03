import { DiceTable } from "@/components/games/dice-table";
export default function DicePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">🎲 Dice</h1>
        <p className="text-white/50 text-sm mt-1">Roll 1–100 · Bet over or under · Up to 2.94× payout</p>
      </div>
      <DiceTable />
    </div>
  );
}

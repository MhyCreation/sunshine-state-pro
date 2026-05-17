import { SlotMachine } from "@/components/games/slot-machine";

export default function SlotsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">🎰 Lucky Spins</h1>
        <p className="text-white/50 text-sm mt-1">5 reels · 9 paylines · Wild multipliers</p>
      </div>
      <SlotMachine />
    </div>
  );
}

import { BaccaratTable } from "@/components/games/baccarat-table";

export default function BaccaratPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">🎴 Baccarat</h1>
        <p className="text-white/50 text-sm mt-1">Player vs Banker · Banker pays 0.95:1 · Tie pays 8:1</p>
      </div>
      <BaccaratTable />
    </div>
  );
}

import { DragonTigerTable } from "@/components/games/dragon-tiger-table";
export default function DragonTigerPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">🐉 Dragon Tiger</h1>
        <p className="text-white/50 text-sm mt-1">One card each · Higher wins · Tie pays 8:1</p>
      </div>
      <DragonTigerTable />
    </div>
  );
}

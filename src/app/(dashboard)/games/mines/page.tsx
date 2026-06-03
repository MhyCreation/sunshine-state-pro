import { MinesTable } from "@/components/games/mines-table";

export default function MinesPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">💣 Mines</h1>
        <p className="text-white/50 text-sm mt-1">Reveal gems, avoid mines · Cash out any time</p>
      </div>
      <MinesTable />
    </div>
  );
}

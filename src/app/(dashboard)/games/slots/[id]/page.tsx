import { notFound } from "next/navigation";
import { getSlotConfig } from "@/components/games/slots/slot-configs";
import { ThemeSlot } from "@/components/games/slots/theme-slot";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ThemeSlotPage({ params }: Props) {
  const { id } = await params;

  if (id === "lucky-spins") {
    notFound();
  }

  const config = getSlotConfig(id);
  if (!config) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">
          {config.emoji} {config.name}
        </h1>
        <p className="text-white/50 text-sm mt-1">
          {config.lineCount} paylines · RTP {config.rtp} · Max Win {config.maxWin}
        </p>
      </div>
      <ThemeSlot config={config} />
    </div>
  );
}

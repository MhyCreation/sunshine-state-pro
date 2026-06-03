import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative h-8 w-8 flex-shrink-0">
        <div className="absolute inset-0 rounded-lg bg-gradient-gold shadow-gold-glow" />
        <div className="absolute inset-0 flex items-center justify-center text-casino-900 font-bold text-sm select-none font-display">
          S
        </div>
      </div>
      <span className="font-display text-xl font-semibold tracking-tight leading-none text-white">
        Sunshine<span className="text-gold-400">Spins</span>
      </span>
    </div>
  );
}

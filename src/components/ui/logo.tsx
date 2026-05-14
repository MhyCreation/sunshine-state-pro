import { cn } from "@/lib/utils";

export function Logo({ className, withWordmark = true }: { className?: string; withWordmark?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative h-8 w-8 rounded-lg bg-gradient-gold flex items-center justify-center shadow-sm">
        <span className="text-navy-800 font-display font-bold text-lg leading-none">S</span>
        <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-gold-400 ring-2 ring-navy-800" />
      </div>
      {withWordmark && (
        <span className="font-display font-semibold text-base tracking-tight">
          Sunshine State <span className="text-gold-600">Pro</span>
        </span>
      )}
    </div>
  );
}

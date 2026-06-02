import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: LucideIcon;
  description?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  description,
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-navy-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-navy-400 uppercase tracking-wider truncate">
            {title}
          </p>
          <p className="mt-2 text-2xl font-display font-semibold text-navy-800 tabular-nums">
            {value}
          </p>
          {change && (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                changeType === "positive"
                  ? "text-emerald-600"
                  : changeType === "negative"
                  ? "text-red-500"
                  : "text-navy-400"
              )}
            >
              {change}
            </p>
          )}
          {description && (
            <p className="mt-0.5 text-xs text-navy-400">{description}</p>
          )}
        </div>
        {Icon && (
          <div className="h-10 w-10 rounded-lg bg-navy-50 flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-navy-400" aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  );
}

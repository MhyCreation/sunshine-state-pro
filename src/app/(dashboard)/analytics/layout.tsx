import { AnalyticsTabs } from "@/components/analytics/analytics-tabs";

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-navy-800">Analytics</h1>
          <p className="text-sm text-navy-400 mt-1">Revenue, paywalls & subscriber insights</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-navy-400 bg-navy-50 rounded-lg px-3 py-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live &middot; Last updated just now
        </div>
      </div>
      <AnalyticsTabs />
      {children}
    </div>
  );
}

import { AnalyticsTabs } from "@/components/analytics/analytics-tabs";

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold text-navy-800">Analytics</h1>
        <p className="text-sm text-navy-400 mt-1">Revenue, paywalls &amp; subscriber insights</p>
      </div>
      <AnalyticsTabs />
      {children}
    </div>
  );
}

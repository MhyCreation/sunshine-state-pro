import { Eye, ShoppingCart, TrendingUp, XCircle } from "lucide-react";
import { MetricCard } from "@/components/analytics/metric-card";
import { PaywallFunnel } from "@/components/analytics/paywall-funnel";
import { AbTestTable } from "@/components/analytics/ab-test-table";

const paywallRows = [
  { name: "Onboarding Paywall", impressions: 4200, conversions: 630, revenue: 12450, convRate: "15.0%" },
  { name: "Feature Gate", impressions: 1800, conversions: 198, revenue: 3960, convRate: "11.0%" },
  { name: "Hard Gate", impressions: 950, conversions: 133, revenue: 2660, convRate: "14.0%" },
  { name: "Retention Offer", impressions: 620, conversions: 87, revenue: 1305, convRate: "14.0%" },
];

export default function PaywallsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Impressions" value="7,570" change="↑ 14% vs last month" changeType="positive" icon={Eye} />
        <MetricCard title="Conversions" value="1,048" change="↑ 9% vs last month" changeType="positive" icon={ShoppingCart} />
        <MetricCard title="Avg Conv. Rate" value="13.8%" change="↑ 0.6pts" changeType="positive" icon={TrendingUp} />
        <MetricCard title="Decline Rate" value="86.2%" change="↓ 0.6pts improvement" changeType="positive" icon={XCircle} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PaywallFunnel impressions={4200} conversions={630} declines={3570} revenue={12450} />

        <div className="bg-white rounded-xl border border-navy-100 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-navy-800 mb-4">Conversions by Platform</h3>
            <div className="space-y-3">
              {[
                { platform: "iOS", pct: 58, conversions: 608, color: "bg-navy-700" },
                { platform: "Android", pct: 28, conversions: 294, color: "bg-gold-400" },
                { platform: "Web", pct: 14, conversions: 146, color: "bg-navy-300" },
              ].map((p) => (
                <div key={p.platform}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-navy-700 font-medium">{p.platform}</span>
                    <span className="text-navy-400">{p.conversions} conv. · {p.pct}%</span>
                  </div>
                  <div className="h-2 bg-navy-50 rounded-full overflow-hidden">
                    <div className={`h-full ${p.color} rounded-full`} style={{ width: `${p.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-navy-800 mb-3">Revenue by Country</h3>
            <div className="space-y-2">
              {[
                { country: "🇺🇸 United States", revenue: "$8,420", pct: 67 },
                { country: "🇨🇦 Canada", revenue: "$1,890", pct: 15 },
                { country: "🇬🇧 United Kingdom", revenue: "$1,260", pct: 10 },
                { country: "🌍 Other", revenue: "$880", pct: 8 },
              ].map((c) => (
                <div key={c.country} className="flex items-center justify-between text-xs py-1">
                  <span className="text-navy-700">{c.country}</span>
                  <span className="font-semibold text-navy-800">{c.revenue}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-navy-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-navy-50">
          <h3 className="text-sm font-semibold text-navy-800">All Paywalls</h3>
          <p className="text-xs text-navy-400 mt-0.5">Performance by individual paywall</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-50 text-xs text-navy-400 uppercase tracking-wider">
                <th className="text-left px-6 py-3">Paywall</th>
                <th className="text-right px-4 py-3">Impressions</th>
                <th className="text-right px-4 py-3">Conversions</th>
                <th className="text-right px-4 py-3">Conv. Rate</th>
                <th className="text-right px-6 py-3">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {paywallRows.map((row) => (
                <tr key={row.name} className="border-b border-navy-50 hover:bg-navy-50/50 transition">
                  <td className="px-6 py-4 font-medium text-navy-800">{row.name}</td>
                  <td className="px-4 py-4 text-right text-navy-600">{row.impressions.toLocaleString()}</td>
                  <td className="px-4 py-4 text-right text-navy-600">{row.conversions.toLocaleString()}</td>
                  <td className="px-4 py-4 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                      {row.convRate}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-navy-800">${row.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AbTestTable />
    </div>
  );
}

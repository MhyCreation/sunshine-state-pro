import { DollarSign, TrendingUp, TrendingDown, RefreshCw, PieChart } from "lucide-react";
import { MetricCard } from "@/components/analytics/metric-card";
import { MrrChart } from "@/components/analytics/mrr-chart";
import { ChurnChart } from "@/components/analytics/churn-chart";

const planData = [
  { name: "Pro Monthly", subscribers: 892, mrr: 7136, ltv: 248 },
  { name: "Pro Annual", subscribers: 634, mrr: 4752, ltv: 380 },
  { name: "Starter Monthly", subscribers: 247, mrr: 1235, ltv: 112 },
  { name: "Enterprise", subscribers: 74, mrr: 1110, ltv: 820 },
];

export default function RevenuePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="MRR" value="$14,230" change="↑ $1,580 new MRR" changeType="positive" icon={DollarSign} />
        <MetricCard title="ARR" value="$170,760" change="On track" changeType="neutral" icon={TrendingUp} />
        <MetricCard title="Avg LTV" value="$284" change="↑ $18 vs last month" changeType="positive" icon={PieChart} />
        <MetricCard title="Churned MRR" value="$420" change="↓ $80 from last month" changeType="positive" icon={TrendingDown} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="New MRR" value="$2,160" description="From new subscribers" />
        <MetricCard title="Expansion MRR" value="$380" description="From upgrades" />
        <MetricCard title="Contraction MRR" value="$140" description="From downgrades" />
        <MetricCard
          title="Net New MRR"
          value="$1,980"
          change="↑ Strong growth"
          changeType="positive"
          icon={RefreshCw}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MrrChart />
        <ChurnChart />
      </div>

      <div className="bg-white rounded-xl border border-navy-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-navy-50">
          <h3 className="text-sm font-semibold text-navy-800">Revenue by Plan</h3>
          <p className="text-xs text-navy-400 mt-0.5">MRR contribution by subscription tier</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-50 text-xs text-navy-400 uppercase tracking-wider">
                <th className="text-left px-6 py-3">Plan</th>
                <th className="text-right px-4 py-3">Subscribers</th>
                <th className="text-right px-4 py-3">MRR</th>
                <th className="text-right px-6 py-3">Avg LTV</th>
              </tr>
            </thead>
            <tbody>
              {planData.map((p) => (
                <tr key={p.name} className="border-b border-navy-50 hover:bg-navy-50/50 transition">
                  <td className="px-6 py-4 font-medium text-navy-800">{p.name}</td>
                  <td className="px-4 py-4 text-right text-navy-600">{p.subscribers.toLocaleString()}</td>
                  <td className="px-4 py-4 text-right font-semibold text-navy-800">${p.mrr.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-navy-600">${p.ltv}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

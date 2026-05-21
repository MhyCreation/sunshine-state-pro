import { Users, UserPlus, UserMinus, RefreshCw } from "lucide-react";
import { MetricCard } from "@/components/analytics/metric-card";
import { SubscriberChart } from "@/components/analytics/subscriber-chart";

const cohortData = [
  { cohort: "Jan 2025", size: 142, m1: "72%", m2: "61%", m3: "54%", m4: "48%", m5: "43%" },
  { cohort: "Feb 2025", size: 156, m1: "75%", m2: "64%", m3: "57%", m4: "51%", m5: "—" },
  { cohort: "Mar 2025", size: 178, m1: "74%", m2: "63%", m3: "55%", m4: "—", m5: "—" },
  { cohort: "Apr 2025", size: 201, m1: "76%", m2: "65%", m3: "—", m4: "—", m5: "—" },
  { cohort: "May 2025", size: 234, m1: "78%", m2: "—", m3: "—", m4: "—", m5: "—" },
];

export default function SubscribersPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Active Subscribers" value="1,847" change="↑ 134 this month" changeType="positive" icon={Users} />
        <MetricCard title="New Subscribers" value="234" change="↑ 24% vs last month" changeType="positive" icon={UserPlus} />
        <MetricCard title="Churned Subscribers" value="67" change="↓ 12 from last month" changeType="positive" icon={UserMinus} />
        <MetricCard title="Trial Conversion" value="62.4%" change="↑ 3.1pts improvement" changeType="positive" icon={RefreshCw} />
      </div>

      <SubscriberChart />

      <div className="bg-white rounded-xl border border-navy-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-navy-50">
          <h3 className="text-sm font-semibold text-navy-800">Cohort Retention</h3>
          <p className="text-xs text-navy-400 mt-0.5">Monthly retention by acquisition cohort</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-50 text-xs text-navy-400 uppercase tracking-wider">
                <th className="text-left px-6 py-3">Cohort</th>
                <th className="text-right px-4 py-3">Size</th>
                {["M1", "M2", "M3", "M4", "M5"].map((h) => (
                  <th key={h} className="text-center px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cohortData.map((row) => (
                <tr key={row.cohort} className="border-b border-navy-50 hover:bg-navy-50/50 transition">
                  <td className="px-6 py-3 font-medium text-navy-800">{row.cohort}</td>
                  <td className="px-4 py-3 text-right text-navy-600">{row.size}</td>
                  {[row.m1, row.m2, row.m3, row.m4, row.m5].map((val, i) => {
                    const opacity = val !== "—" ? parseFloat(val) / 100 : 0;
                    return (
                      <td key={i} className="px-4 py-3 text-center">
                        {val !== "—" ? (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                            style={{
                              backgroundColor: `rgba(10,24,52,${opacity * 0.12 + 0.05})`,
                              color: `rgba(10,24,52,${opacity * 0.7 + 0.3})`,
                            }}
                          >
                            {val}
                          </span>
                        ) : (
                          <span className="text-navy-200">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-navy-100 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-navy-800 mb-4">By Platform</h3>
          <div className="space-y-3">
            {[
              { label: "iOS", value: 1072, pct: 58, color: "bg-navy-700" },
              { label: "Android", value: 517, pct: 28, color: "bg-gold-400" },
              { label: "Web", value: 258, pct: 14, color: "bg-navy-300" },
            ].map((p) => (
              <div key={p.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-navy-700 font-medium">{p.label}</span>
                  <span className="text-navy-400">{p.value.toLocaleString()} · {p.pct}%</span>
                </div>
                <div className="h-2 bg-navy-50 rounded-full overflow-hidden">
                  <div className={`h-full ${p.color} rounded-full`} style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-navy-100 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-navy-800 mb-4">By Plan</h3>
          <div className="space-y-3">
            {[
              { label: "Pro Monthly", value: 892, pct: 48, color: "bg-navy-700" },
              { label: "Pro Annual", value: 634, pct: 34, color: "bg-gold-500" },
              { label: "Starter Monthly", value: 247, pct: 13, color: "bg-navy-300" },
              { label: "Enterprise", value: 74, pct: 4, color: "bg-gold-300" },
            ].map((p) => (
              <div key={p.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-navy-700 font-medium">{p.label}</span>
                  <span className="text-navy-400">{p.value.toLocaleString()} · {p.pct}%</span>
                </div>
                <div className="h-2 bg-navy-50 rounded-full overflow-hidden">
                  <div className={`h-full ${p.color} rounded-full`} style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

const data = [
  { month: "Jan", mrr: 5400, new: 640, churned: 180 },
  { month: "Feb", mrr: 6200, new: 720, churned: 160 },
  { month: "Mar", mrr: 7100, new: 800, churned: 190 },
  { month: "Apr", mrr: 7800, new: 750, churned: 200 },
  { month: "May", mrr: 8600, new: 830, churned: 170 },
  { month: "Jun", mrr: 9300, new: 880, churned: 220 },
  { month: "Jul", mrr: 10100, new: 910, churned: 210 },
  { month: "Aug", mrr: 10900, new: 950, churned: 230 },
  { month: "Sep", mrr: 11600, new: 980, churned: 240 },
  { month: "Oct", mrr: 12400, new: 1020, churned: 250 },
  { month: "Nov", mrr: 13200, new: 1060, churned: 260 },
  { month: "Dec", mrr: 14230, new: 1100, churned: 270 },
];

export function MrrChart() {
  return (
    <div className="bg-white rounded-xl border border-navy-100 p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-navy-800">Monthly Recurring Revenue</h3>
        <p className="text-xs text-navy-400 mt-0.5">MRR trend over the last 12 months</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F5C547" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#F5C547" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="newGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E7EAF2" />
            <XAxis
              dataKey="month"
              tick={{ fill: "#9AA5C2", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#9AA5C2", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                background: "#0A1834",
                border: "1px solid rgba(245,197,71,0.3)",
                borderRadius: 8,
                fontSize: 12,
                color: "#fff",
              }}
              formatter={(v: number, name: string) => [
                `$${v.toLocaleString()}`,
                name === "mrr" ? "Total MRR" : name === "new" ? "New MRR" : "Churned MRR",
              ]}
            />
            <Legend
              formatter={(v) =>
                v === "mrr" ? "Total MRR" : v === "new" ? "New MRR" : "Churned MRR"
              }
            />
            <Area
              type="monotone"
              dataKey="mrr"
              stroke="#D4A017"
              strokeWidth={2}
              fill="url(#mrrGrad)"
            />
            <Area
              type="monotone"
              dataKey="new"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#newGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

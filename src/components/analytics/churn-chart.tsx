"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  Legend,
} from "recharts";

const data = [
  { month: "Jan", churnRate: 5.2, ltv: 85 },
  { month: "Feb", churnRate: 5.0, ltv: 91 },
  { month: "Mar", churnRate: 4.8, ltv: 97 },
  { month: "Apr", churnRate: 4.5, ltv: 103 },
  { month: "May", churnRate: 4.3, ltv: 109 },
  { month: "Jun", churnRate: 4.1, ltv: 115 },
  { month: "Jul", churnRate: 3.9, ltv: 121 },
  { month: "Aug", churnRate: 3.7, ltv: 127 },
  { month: "Sep", churnRate: 3.5, ltv: 133 },
  { month: "Oct", churnRate: 3.4, ltv: 139 },
  { month: "Nov", churnRate: 3.3, ltv: 145 },
  { month: "Dec", churnRate: 3.2, ltv: 151 },
];

export function ChurnChart() {
  return (
    <div className="bg-white rounded-xl border border-navy-100 p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-navy-800">Churn Rate &amp; LTV Trend</h3>
        <p className="text-xs text-navy-400 mt-0.5">Monthly churn % and average customer LTV</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E7EAF2" />
            <XAxis
              dataKey="month"
              tick={{ fill: "#9AA5C2", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: "#9AA5C2", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: "#9AA5C2", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                background: "#0A1834",
                border: "1px solid rgba(245,197,71,0.3)",
                borderRadius: 8,
                fontSize: 12,
                color: "#fff",
              }}
            />
            <Legend />
            <ReferenceLine
              yAxisId="left"
              y={5}
              stroke="rgba(239,68,68,0.4)"
              strokeDasharray="4 4"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="churnRate"
              stroke="#EF4444"
              strokeWidth={2}
              dot={{ r: 3, fill: "#EF4444" }}
              name="Churn Rate %"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="ltv"
              stroke="#F5C547"
              strokeWidth={2}
              dot={{ r: 3, fill: "#F5C547" }}
              name="Avg LTV $"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

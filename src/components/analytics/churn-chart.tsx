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

const data = Array.from({ length: 12 }, (_, i) => ({
  month: new Date(2025, i, 1).toLocaleString("default", { month: "short" }),
  churnRate: parseFloat((5.5 - i * 0.2 + (Math.random() - 0.5) * 0.6).toFixed(1)),
  ltv: Math.round(85 + i * 6 + Math.random() * 15),
}));

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
            <XAxis dataKey="month" tick={{ fill: "#9AA5C2", fontSize: 11 }} axisLine={false} tickLine={false} />
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
              stroke="#EF444470"
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

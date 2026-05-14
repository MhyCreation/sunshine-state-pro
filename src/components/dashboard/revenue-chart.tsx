"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Placeholder data — replace with a real query in Phase 2
const data = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  revenue: Math.round(800 + i * 35 + Math.random() * 400),
}));

export function RevenueChart() {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F5C547" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#F5C547" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
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
              color: "white",
            }}
            formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#D4A017"
            strokeWidth={2}
            fill="url(#rev)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

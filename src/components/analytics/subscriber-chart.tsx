"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

const data = Array.from({ length: 12 }, (_, i) => ({
  month: new Date(2025, i, 1).toLocaleString("default", { month: "short" }),
  new: Math.round(120 + i * 15 + Math.random() * 35),
  churned: Math.round(28 + Math.random() * 22),
}));

export function SubscriberChart() {
  return (
    <div className="bg-white rounded-xl border border-navy-100 p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-navy-800">Subscriber Activity</h3>
        <p className="text-xs text-navy-400 mt-0.5">New vs. churned subscribers per month</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E7EAF2" />
            <XAxis dataKey="month" tick={{ fill: "#9AA5C2", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#9AA5C2", fontSize: 11 }} axisLine={false} tickLine={false} />
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
            <Bar dataKey="new" name="New" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="churned" name="Churned" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

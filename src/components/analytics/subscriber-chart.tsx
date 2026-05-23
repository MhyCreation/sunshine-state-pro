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

const data = [
  { month: "Jan", new: 122, churned: 32 },
  { month: "Feb", new: 138, churned: 29 },
  { month: "Mar", new: 151, churned: 35 },
  { month: "Apr", new: 164, churned: 31 },
  { month: "May", new: 178, churned: 38 },
  { month: "Jun", new: 192, churned: 34 },
  { month: "Jul", new: 205, churned: 40 },
  { month: "Aug", new: 214, churned: 37 },
  { month: "Sep", new: 220, churned: 42 },
  { month: "Oct", new: 228, churned: 44 },
  { month: "Nov", new: 231, churned: 41 },
  { month: "Dec", new: 234, churned: 46 },
];

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
            <Bar dataKey="new" name="New" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="churned" name="Churned" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

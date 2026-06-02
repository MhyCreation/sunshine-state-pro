"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface PaywallFunnelProps {
  impressions?: number;
  conversions?: number;
  declines?: number;
  revenue?: number;
}

export function PaywallFunnel({
  impressions = 4200,
  conversions = 630,
  declines = 3570,
  revenue = 12450,
}: PaywallFunnelProps) {
  const conversionRate = impressions > 0 ? ((conversions / impressions) * 100).toFixed(1) : "0";
  const rpi = impressions > 0 ? (revenue / impressions).toFixed(2) : "0";

  const funnelData = [
    { stage: "Impressions", value: impressions },
    { stage: "Engaged", value: Math.round(impressions * 0.6) },
    { stage: "Conversions", value: conversions },
  ];

  const colors = ["#0A1834", "#4F6090", "#D4A017"];

  return (
    <div className="bg-white rounded-xl border border-navy-100 p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-navy-800">Paywall Conversion Funnel</h3>
          <p className="text-xs text-navy-400 mt-0.5">From impression to purchase</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-gold-600">{conversionRate}%</p>
          <p className="text-xs text-navy-400">conversion rate</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-5">
        <div className="bg-navy-50 rounded-lg p-3 text-center">
          <p className="text-base font-semibold text-navy-800">{impressions.toLocaleString()}</p>
          <p className="text-xs text-navy-400 mt-0.5">Impressions</p>
        </div>
        <div className="bg-navy-50 rounded-lg p-3 text-center">
          <p className="text-base font-semibold text-navy-800">{conversions.toLocaleString()}</p>
          <p className="text-xs text-navy-400 mt-0.5">Conversions</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <p className="text-base font-semibold text-red-600">{declines.toLocaleString()}</p>
          <p className="text-xs text-navy-400 mt-0.5">Declines</p>
        </div>
        <div className="bg-gold-50 rounded-lg p-3 text-center">
          <p className="text-base font-semibold text-gold-700">${revenue.toLocaleString()}</p>
          <p className="text-xs text-navy-400 mt-0.5">Revenue</p>
        </div>
      </div>

      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
            <XAxis type="number" tick={{ fill: "#9AA5C2", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="stage"
              tick={{ fill: "#7281A8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={88}
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
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              {funnelData.map((_, idx) => (
                <Cell key={idx} fill={colors[idx]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-3 text-center text-xs text-navy-400">
        Revenue per impression:{" "}
        <span className="font-semibold text-navy-700">${rpi}</span>
      </p>
    </div>
  );
}

"use client";

interface AbTest {
  id: string;
  name: string;
  paywall: string;
  variantA: { name: string; impressions: number; conversions: number };
  variantB: { name: string; impressions: number; conversions: number };
  status: "active" | "completed" | "paused";
  winner?: "a" | "b";
}

const mockTests: AbTest[] = [
  {
    id: "1",
    name: "Price anchoring test",
    paywall: "Onboarding Paywall",
    variantA: { name: "Control", impressions: 1200, conversions: 144 },
    variantB: { name: "Annual First", impressions: 1180, conversions: 189 },
    status: "active",
  },
  {
    id: "2",
    name: "Headline copy test",
    paywall: "Feature Gate",
    variantA: { name: "Benefits-led", impressions: 800, conversions: 96 },
    variantB: { name: "Urgency-led", impressions: 810, conversions: 121 },
    status: "completed",
    winner: "b",
  },
];

function convRate(c: number, impressions: number) {
  return impressions > 0 ? ((c / impressions) * 100).toFixed(1) + "%" : "—";
}

const statusColors: Record<AbTest["status"], string> = {
  active: "bg-emerald-100 text-emerald-700",
  completed: "bg-navy-100 text-navy-600",
  paused: "bg-gold-100 text-gold-700",
};

export function AbTestTable() {
  return (
    <div className="bg-white rounded-xl border border-navy-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-navy-50">
        <h3 className="text-sm font-semibold text-navy-800">A/B Tests</h3>
        <p className="text-xs text-navy-400 mt-0.5">Paywall variant performance</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-50 text-xs text-navy-400 uppercase tracking-wider">
              <th className="text-left px-6 py-3">Test / Paywall</th>
              <th className="text-center px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Variant A</th>
              <th className="text-right px-4 py-3">Variant B</th>
              <th className="text-center px-4 py-3">Winner</th>
            </tr>
          </thead>
          <tbody>
            {mockTests.map((test) => (
              <tr key={test.id} className="border-b border-navy-50 hover:bg-navy-50/50 transition">
                <td className="px-6 py-4">
                  <p className="font-medium text-navy-800">{test.name}</p>
                  <p className="text-xs text-navy-400 mt-0.5">{test.paywall}</p>
                </td>
                <td className="px-4 py-4 text-center">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      statusColors[test.status]
                    }`}
                  >
                    {test.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <p className="font-medium text-navy-800">
                    {convRate(test.variantA.conversions, test.variantA.impressions)}
                  </p>
                  <p className="text-xs text-navy-400">
                    {test.variantA.impressions.toLocaleString()} impr.
                  </p>
                </td>
                <td className="px-4 py-4 text-right">
                  <p className="font-medium text-navy-800">
                    {convRate(test.variantB.conversions, test.variantB.impressions)}
                  </p>
                  <p className="text-xs text-navy-400">
                    {test.variantB.impressions.toLocaleString()} impr.
                  </p>
                </td>
                <td className="px-4 py-4 text-center">
                  {test.winner ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gold-100 text-gold-700">
                      Variant {test.winner.toUpperCase()}
                    </span>
                  ) : (
                    <span className="text-navy-300">&mdash;</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

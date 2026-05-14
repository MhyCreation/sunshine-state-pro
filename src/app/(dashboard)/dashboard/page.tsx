import { createClient } from "@/lib/supabase/server";
import { Sparkles, Bell, ArrowUpRight } from "lucide-react";
import { RevenueChart } from "@/components/dashboard/revenue-chart";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: membership } = await supabase
    .from("business_members")
    .select("full_name, businesses(name)")
    .eq("user_id", user!.id)
    .maybeSingle();

  // @ts-expect-error supabase typed-join
  const businessName = membership?.businesses?.name ?? "your business";
  const firstName = (membership?.full_name ?? user?.email ?? "").split(" ")[0];

  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const kpis = [
    { label: "Revenue MTD", value: "$48,240", trend: "+18%", positive: true },
    { label: "Bookings", value: "142", trend: "+6%", positive: true },
    { label: "Unpaid invoices", value: "$3,420", trend: "8 outstanding", positive: false },
    { label: "Retention", value: "94%", trend: "+2 pts", positive: true },
  ];

  const schedule = [
    { time: "9:00 AM", title: "Pressure wash · 412 Ocean Dr", crew: "Crew A", color: "bg-emerald-500" },
    { time: "11:30 AM", title: "Airbnb turnover · Coral Springs unit 4", crew: "Crew B", color: "bg-gold-400" },
    { time: "2:00 PM", title: "Mobile detail · Mercedes GLE", crew: "Crew C", color: "bg-navy-300" },
    { time: "4:30 PM", title: "Lawn maintenance · 1840 Palm Ave", crew: "Crew A", color: "bg-emerald-500" },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-800">
            Good morning, {firstName} 👋
          </h1>
          <p className="text-sm text-navy-500 mt-1">
            {today} · {businessName} · 6 crews in the field
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-10 w-10 rounded-md bg-white border border-navy-100 flex items-center justify-center text-navy-600 hover:bg-navy-50 transition">
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-lg p-4 border border-navy-100">
            <div className="text-xs text-navy-500">{kpi.label}</div>
            <div className="mt-1 font-display text-2xl font-semibold text-navy-800">{kpi.value}</div>
            <div className={`text-xs mt-1 ${kpi.positive ? "text-emerald-600" : "text-amber-600"}`}>
              {kpi.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white rounded-lg p-5 border border-navy-100">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display font-semibold text-navy-800">Revenue trend</h2>
            <span className="text-xs text-navy-500">Last 30 days</span>
          </div>
          <RevenueChart />
        </div>

        <div className="bg-navy-800 text-white rounded-lg p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-gold-400/20 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-md bg-gradient-gold flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-navy-800" />
              </div>
              <span className="text-xs font-medium">AI insights</span>
            </div>
            <p className="text-sm leading-relaxed text-white/85 mb-4">
              12 customers haven't booked in 45+ days. Their average lifetime value is $840.
              A targeted winback campaign could recover ~$4,000 this month.
            </p>
            <button className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-gradient-gold text-navy-800 text-xs font-semibold hover:brightness-105 transition">
              Generate winback campaign
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-5 border border-navy-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-navy-800">Today's schedule</h2>
          <span className="text-xs text-navy-500">{schedule.length} jobs</span>
        </div>
        <div className="divide-y divide-navy-50">
          {schedule.map((s) => (
            <div key={s.time} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${s.color}`} />
                <div>
                  <div className="text-sm font-medium text-navy-800">{s.title}</div>
                  <div className="text-xs text-navy-500 mt-0.5">{s.time} · {s.crew}</div>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-navy-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

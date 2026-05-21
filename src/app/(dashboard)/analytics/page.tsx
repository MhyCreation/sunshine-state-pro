import Link from "next/link";
import { DollarSign, TrendingUp, Users, Activity, ChevronRight } from "lucide-react";
import { MetricCard } from "@/components/analytics/metric-card";
import { MrrChart } from "@/components/analytics/mrr-chart";
import { SubscriberChart } from "@/components/analytics/subscriber-chart";

export default function AnalyticsOverviewPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="MRR"
          value="$14,230"
          change="↑ 12.4% vs last month"
          changeType="positive"
          icon={DollarSign}
        />
        <MetricCard
          title="ARR"
          value="$170,760"
          change="↑ 8.1% vs last year"
          changeType="positive"
          icon={TrendingUp}
        />
        <MetricCard
          title="Active Subscribers"
          value="1,847"
          change="↑ 134 this month"
          changeType="positive"
          icon={Users}
        />
        <MetricCard
          title="Churn Rate"
          value="3.2%"
          change="↓ 0.4pts improvement"
          changeType="positive"
          icon={Activity}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MrrChart />
        <SubscriberChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          {
            href: "/dashboard/analytics/revenue",
            title: "Revenue Details",
            desc: "MRR, ARR, LTV, churn analysis",
          },
          {
            href: "/dashboard/analytics/paywalls",
            title: "Paywall Analytics",
            desc: "Conversions, funnels, A/B tests",
          },
          {
            href: "/dashboard/analytics/subscribers",
            title: "Subscriber Insights",
            desc: "Cohorts, retention, segments",
          },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-white rounded-xl border border-navy-100 p-5 flex items-center justify-between group hover:border-gold-400 transition shadow-sm"
          >
            <div>
              <p className="text-sm font-semibold text-navy-800">{link.title}</p>
              <p className="text-xs text-navy-400 mt-0.5">{link.desc}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-navy-300 group-hover:text-gold-500 transition" />
          </Link>
        ))}
      </div>
    </div>
  );
}

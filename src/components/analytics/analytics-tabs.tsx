"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/dashboard/analytics", label: "Overview", exact: true },
  { href: "/dashboard/analytics/revenue", label: "Revenue" },
  { href: "/dashboard/analytics/paywalls", label: "Paywalls" },
  { href: "/dashboard/analytics/subscribers", label: "Subscribers" },
];

export function AnalyticsTabs() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 border-b border-navy-100">
      {tabs.map((tab) => {
        const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "px-4 py-2.5 text-sm font-medium rounded-t-md transition border-b-2 -mb-px",
              active
                ? "text-navy-800 border-gold-400"
                : "text-navy-400 border-transparent hover:text-navy-700"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

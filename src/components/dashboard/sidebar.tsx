"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Calendar, Users, FileText, Route, Sparkles,
  BarChart3, Settings, LogOut, KanbanSquare, CreditCard,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/schedule", icon: Calendar, label: "Schedule" },
  { href: "/dashboard/pipeline", icon: KanbanSquare, label: "Pipeline" },
  { href: "/dashboard/customers", icon: Users, label: "Customers" },
  { href: "/dashboard/invoices", icon: FileText, label: "Invoices" },
  { href: "/dashboard/routes", icon: Route, label: "Routes" },
  { href: "/dashboard/ai", icon: Sparkles, label: "AI assistant" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/billing", icon: CreditCard, label: "Billing" },
];

export function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-navy-800 text-white flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-white/10">
        <Logo className="[&_span]:text-white [&_.text-gold-600]:text-gold-400" />
      </div>

      <nav className="flex-1 px-3 py-5 space-y-0.5">
        <div className="px-3 mb-2 text-[10px] uppercase tracking-wider text-white/40">Workspace</div>
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                active
                  ? "bg-gold-400/15 text-gold-400"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
        <div className="mt-3 px-3 py-2 flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-gradient-gold flex items-center justify-center text-navy-800 text-xs font-semibold">
            {userName.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div className="text-xs">
            <div className="font-medium">{userName}</div>
            <div className="text-white/40">Owner</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

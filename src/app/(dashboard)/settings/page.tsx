import { Settings, User, Building2, Bell, Shield, CreditCard } from "lucide-react";
import Link from "next/link";

const settingsSections = [
  {
    icon: User,
    title: "Profile",
    description: "Update your name, email address, and password.",
    status: "coming-soon" as const,
  },
  {
    icon: Building2,
    title: "Business details",
    description: "Business name, address, logo, and service area.",
    status: "coming-soon" as const,
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Email and SMS alert preferences for jobs, payments, and reviews.",
    status: "coming-soon" as const,
  },
  {
    icon: Shield,
    title: "Security",
    description: "Two-factor authentication, active sessions, and API keys.",
    status: "coming-soon" as const,
  },
  {
    icon: CreditCard,
    title: "Billing & plan",
    description: "Manage your subscription, payment method, and invoices.",
    href: "/dashboard/billing",
    status: "available" as const,
  },
];

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-navy-800">Settings</h1>
        <p className="text-sm text-navy-500 mt-1">Manage your account and business preferences.</p>
      </header>

      <div className="space-y-2">
        {settingsSections.map((section) => {
          const content = (
            <div className="bg-white rounded-xl border border-navy-100 p-5 flex items-start gap-4 hover:bg-navy-50/50 transition">
              <div className="h-10 w-10 rounded-lg bg-navy-100 flex items-center justify-center shrink-0">
                <section.icon className="h-5 w-5 text-navy-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-navy-800">{section.title}</span>
                  {section.status === "coming-soon" && (
                    <span className="text-[10px] font-medium text-gold-600 bg-gold-400/10 border border-gold-400/20 rounded-full px-2 py-0.5">
                      Coming soon
                    </span>
                  )}
                </div>
                <p className="text-xs text-navy-500 mt-0.5">{section.description}</p>
              </div>
              {section.status === "available" && (
                <Settings className="h-4 w-4 text-navy-400 shrink-0 mt-0.5" />
              )}
            </div>
          );

          return section.href ? (
            <Link key={section.title} href={section.href}>
              {content}
            </Link>
          ) : (
            <div key={section.title}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}

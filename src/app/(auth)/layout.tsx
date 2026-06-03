import Link from "next/link";
import { Check, Star } from "lucide-react";
import { Logo } from "@/components/ui/logo";

const features = [
  "Smart scheduling & route optimization",
  "AI quotes, follow-ups & SMS reminders",
  "Built-in CRM · Invoicing · Stripe payments",
];

const stats = [
  { n: "2,400+", l: "businesses" },
  { n: "14-day", l: "free trial" },
  { n: "4.9★", l: "avg rating" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left panel */}
      <div className="hidden md:flex bg-navy-800 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-gold-400/15 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gold-600/8 blur-3xl" />

        <Link href="/" className="relative">
          <Logo className="text-white [&_span]:text-white [&_.text-gold-600]:text-gold-400" />
        </Link>

        <div className="relative">
          <div className="font-display text-gold-400 text-5xl leading-none mb-3">"</div>
          <blockquote className="font-display text-xl leading-snug mb-6">
            We replaced four different tools with Sunshine. Our crews ship 40% more
            jobs and I haven&apos;t touched a spreadsheet in months.
          </blockquote>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-full bg-gradient-gold flex items-center justify-center text-navy-800 font-semibold text-sm shrink-0">
              MR
            </div>
            <div>
              <div className="font-medium text-sm">Marcus Reyes</div>
              <div className="text-xs text-white/50">Reyes Pressure Washing · Tampa, FL</div>
            </div>
            <div className="ml-auto flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-gold-400 text-gold-400" />
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-sm text-white/70">
                <Check className="h-4 w-4 text-gold-400 shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex gap-8 pt-6 border-t border-white/10">
          {stats.map((s) => (
            <div key={s.l}>
              <div className="font-display font-semibold text-gold-400 text-lg">{s.n}</div>
              <div className="text-xs text-white/40 mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}

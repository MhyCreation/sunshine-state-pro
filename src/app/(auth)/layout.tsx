import { Logo } from "@/components/ui/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex bg-navy-800 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-1/2 -right-32 h-96 w-96 rounded-full bg-gold-400/15 blur-3xl" />
        <Logo className="relative text-white [&_span]:text-white [&_.text-gold-600]:text-gold-400" />
        <div className="relative max-w-md">
          <blockquote className="font-display text-2xl leading-snug">
            "We replaced four different tools with Sunshine. Our crews ship 40% more jobs and I haven't touched a spreadsheet in months."
          </blockquote>
          <div className="mt-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-gold flex items-center justify-center text-navy-800 font-semibold text-sm">
              MR
            </div>
            <div>
              <div className="font-medium text-sm">Marcus Reyes</div>
              <div className="text-xs text-white/60">Reyes Pressure Washing · Tampa</div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}

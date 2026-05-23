import { redirect } from "next/navigation";
import { CheckCircle2, Zap, Shield } from "lucide-react";
import {
  ensureBillingColumns,
  getBusinessPlan,
  createCheckoutSession,
  createPortalSession,
} from "@/lib/actions/billing";
import { PLANS } from "@/lib/stripe";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  await ensureBillingColumns();

  const result = await getBusinessPlan();
  if (!result) redirect("/login");

  const { plan } = result;
  const isPro = plan === "pro";
  const params = await searchParams;
  const success = params.success === "true";

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-navy-800">
          Billing &amp; Plan
        </h1>
        <p className="text-sm text-navy-500 mt-1">
          Manage your subscription and billing details.
        </p>
      </div>

      {success && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <p className="text-sm font-medium text-emerald-700">
            You&apos;re now on the Pro plan — thank you!
          </p>
        </div>
      )}

      {/* Current plan badge */}
      <div className="mb-6 flex items-center gap-3 rounded-lg border border-navy-100 bg-white px-5 py-4">
        <div
          className={`h-9 w-9 rounded-md flex items-center justify-center ${
            isPro ? "bg-gradient-gold" : "bg-navy-100"
          }`}
        >
          {isPro ? (
            <Zap className="h-4 w-4 text-navy-800" />
          ) : (
            <Shield className="h-4 w-4 text-navy-500" />
          )}
        </div>
        <div>
          <div className="text-xs text-navy-500">Current plan</div>
          <div className="font-semibold text-navy-800">
            {isPro ? "Pro — $29/mo" : "Free"}
          </div>
        </div>
        {isPro && (
          <form action={createPortalSession} className="ml-auto">
            <button
              type="submit"
              className="text-sm font-medium text-navy-600 hover:text-navy-800 underline underline-offset-2 transition"
            >
              Manage subscription →
            </button>
          </form>
        )}
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-2 gap-5">
        {/* Free */}
        <div
          className={`rounded-xl border-2 p-6 transition ${
            !isPro
              ? "border-navy-800 bg-navy-800 text-white"
              : "border-navy-100 bg-white"
          }`}
        >
          <div className="mb-5">
            <div
              className={`text-xs font-semibold uppercase tracking-widest mb-1 ${
                !isPro ? "text-white/50" : "text-navy-400"
              }`}
            >
              Free
            </div>
            <div className="flex items-end gap-1">
              <span
                className={`text-4xl font-bold ${
                  !isPro ? "text-white" : "text-navy-800"
                }`}
              >
                $0
              </span>
              <span
                className={`text-sm mb-1 ${
                  !isPro ? "text-white/50" : "text-navy-400"
                }`}
              >
                /mo
              </span>
            </div>
          </div>

          <ul className="space-y-2.5 mb-6">
            {PLANS.free.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <CheckCircle2
                  className={`h-4 w-4 mt-0.5 shrink-0 ${
                    !isPro ? "text-white/60" : "text-navy-400"
                  }`}
                />
                <span className={!isPro ? "text-white/80" : "text-navy-600"}>
                  {f}
                </span>
              </li>
            ))}
          </ul>

          <div
            className={`text-center text-sm font-medium py-2 rounded-lg ${
              !isPro
                ? "bg-white/10 text-white"
                : "bg-navy-50 text-navy-500"
            }`}
          >
            {!isPro ? "Current plan" : "Downgrade"}
          </div>
        </div>

        {/* Pro */}
        <div
          className={`rounded-xl border-2 p-6 transition ${
            isPro
              ? "border-gold-400 bg-gold-50"
              : "border-gold-300 bg-white"
          }`}
        >
          <div className="mb-5">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className="h-3.5 w-3.5 text-gold-600" />
              <span className="text-xs font-semibold uppercase tracking-widest text-gold-600">
                Pro
              </span>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-bold text-navy-800">$29</span>
              <span className="text-sm mb-1 text-navy-400">/mo</span>
            </div>
          </div>

          <ul className="space-y-2.5 mb-6">
            {PLANS.pro.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-gold-500" />
                <span className="text-navy-600">{f}</span>
              </li>
            ))}
          </ul>

          {isPro ? (
            <div className="text-center text-sm font-medium py-2 rounded-lg bg-gold-400/20 text-gold-700">
              Current plan
            </div>
          ) : (
            <form action={createCheckoutSession}>
              <input type="hidden" name="plan" value="pro" />
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-gradient-gold text-navy-800 text-sm font-semibold hover:brightness-105 transition"
              >
                Upgrade to Pro →
              </button>
            </form>
          )}
        </div>
      </div>

      <p className="mt-4 text-xs text-center text-navy-400">
        Payments are processed securely by Stripe. Cancel anytime.
      </p>
    </div>
  );
}

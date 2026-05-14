"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, Users, FileText, Sparkles, Route, MessageSquare, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Calendar, title: "Smart scheduling", body: "Drag-and-drop calendar with recurring jobs, Airbnb turnover automation, and crew assignments." },
  { icon: Users, title: "Built-in CRM", body: "Customer profiles, service history, smart segments, and a lead pipeline that converts." },
  { icon: FileText, title: "Quotes & invoices", body: "Branded estimates, e-sign, Stripe payments, and recurring billing — all in one click." },
  { icon: Sparkles, title: "AI assistant", body: "Generates quotes, drafts follow-ups, suggests upsells, and answers customer questions." },
  { icon: Route, title: "Route optimization", body: "Google Maps powered routing saves your crews 90+ minutes of windshield time daily." },
  { icon: MessageSquare, title: "Two-way SMS", body: "Missed-call text-back, automated reminders, review requests — Twilio under the hood." },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl mb-16">
          <div className="text-sm font-medium text-gold-600 mb-3">Everything you need</div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-navy-800">
            One platform.<br />Every part of your business.
          </h2>
          <p className="mt-4 text-navy-500">
            Stop duct-taping ten tools together. Sunshine replaces your scheduler,
            CRM, invoicing app, and follow-up tool with one beautifully designed system.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-navy-100 rounded-2xl overflow-hidden border border-navy-100">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bg-white p-8 hover:bg-navy-50/50 transition group"
            >
              <div className="h-10 w-10 rounded-lg bg-navy-800 flex items-center justify-center mb-5 group-hover:bg-gradient-gold transition">
                <f.icon className="h-5 w-5 text-gold-400 group-hover:text-navy-800" />
              </div>
              <h3 className="font-display font-semibold text-lg text-navy-800 mb-2">{f.title}</h3>
              <p className="text-sm text-navy-500 leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const plans = [
  {
    name: "Starter",
    price: 49,
    description: "For solo operators just getting set up.",
    features: ["Up to 2 users", "100 active customers", "Booking + CRM", "Invoicing + Stripe", "Email support"],
  },
  {
    name: "Pro",
    price: 129,
    description: "For growing crews running multiple jobs daily.",
    features: ["Up to 10 users", "Unlimited customers", "Route optimization", "AI follow-ups & quotes", "SMS automation", "Priority support"],
    featured: true,
  },
  {
    name: "Enterprise",
    price: 349,
    description: "For multi-location operators and franchises.",
    features: ["Unlimited users", "Multi-location", "White-label portal", "API access", "Dedicated CSM", "Custom integrations"],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-navy-50">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <div className="text-sm font-medium text-gold-600 mb-3">Pricing</div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-navy-800">
            Priced to grow with you
          </h2>
          <p className="mt-4 text-navy-500 max-w-lg mx-auto">
            14-day free trial. No credit card required. Cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={
                plan.featured
                  ? "rounded-2xl bg-navy-800 text-white p-8 ring-2 ring-gold-400 shadow-xl relative"
                  : "rounded-2xl bg-white p-8 border border-navy-100"
              }
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-gold text-navy-800 text-xs font-semibold">
                  Most popular
                </div>
              )}
              <h3 className={`font-display text-xl font-semibold ${plan.featured ? "text-white" : "text-navy-800"}`}>
                {plan.name}
              </h3>
              <p className={`mt-2 text-sm ${plan.featured ? "text-white/60" : "text-navy-500"}`}>
                {plan.description}
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className={`font-display text-5xl font-semibold ${plan.featured ? "text-gold-400" : "text-navy-800"}`}>
                  ${plan.price}
                </span>
                <span className={plan.featured ? "text-white/50" : "text-navy-400"}>/mo</span>
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feat) => (
                  <li key={feat} className={`flex items-start gap-2 text-sm ${plan.featured ? "text-white/80" : "text-navy-600"}`}>
                    <Check className={`h-4 w-4 mt-0.5 shrink-0 ${plan.featured ? "text-gold-400" : "text-navy-800"}`} />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block mt-8">
                <Button
                  variant={plan.featured ? "gold" : "outline"}
                  className="w-full"
                  size="lg"
                >
                  Start free trial
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const faqs = [
  { q: "How long is the free trial?", a: "14 days, no credit card required. Full access to all Pro features." },
  { q: "Can I import customers from my old system?", a: "Yes — CSV import works on day one. We also have one-click migration from Jobber and Housecall Pro on Pro and Enterprise plans." },
  { q: "Does the AI cost extra?", a: "No. All AI features (quote generation, follow-ups, insights) are included on Pro and Enterprise." },
  { q: "Do you have a mobile app?", a: "Yes — iOS and Android apps for crew check-ins, route navigation, and on-site invoicing. Coming Phase 3 of this build." },
  { q: "Is my data secure?", a: "Yes. Row-level encryption, SOC 2 process underway, and we never share data across tenants. Period." },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24 bg-white">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center mb-12">
          <div className="text-sm font-medium text-gold-600 mb-3">FAQ</div>
          <h2 className="font-display text-4xl font-semibold tracking-tight text-navy-800">
            Questions, answered
          </h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-xl border border-navy-100 bg-white p-5 open:bg-navy-50/50 transition">
              <summary className="cursor-pointer font-display font-medium text-navy-800 list-none flex items-center justify-between">
                {f.q}
                <span className="text-gold-600 group-open:rotate-45 transition text-xl">+</span>
              </summary>
              <p className="mt-3 text-sm text-navy-500 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CTA() {
  return (
    <section className="bg-navy-800 text-white py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-gold-400/10 blur-3xl" />
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <h2 className="font-display text-4xl md:text-6xl font-semibold tracking-tight">
          Ready to put your business{" "}
          <span className="italic text-gold-400">on autopilot?</span>
        </h2>
        <p className="mt-6 text-white/70 max-w-lg mx-auto">
          Join the operators who stopped working in their business and started working on it.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <Link href="/signup">
            <Button variant="gold" size="lg">Start 14-day trial</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="bg-white/5 border-white/20 text-white hover:bg-white/10">
              Sign in
            </Button>
          </Link>
        </div>
        <p className="mt-6 text-xs text-white/40">No credit card. Cancel anytime.</p>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-navy-900 text-white/60 py-10 text-sm">
      <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="h-6 w-6 rounded-md bg-gradient-gold flex items-center justify-center">
            <span className="text-navy-800 font-display font-bold text-sm">S</span>
          </div>
          <span className="font-display">Sunshine State Pro</span>
        </div>
        <div>© {new Date().getFullYear()} Sunshine State Pro. Built in Florida.</div>
      </div>
    </footer>
  );
}

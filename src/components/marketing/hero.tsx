"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy-800 text-white">
      <div className="absolute inset-0 bg-grid opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gold-400/10 blur-3xl" />

      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-gold flex items-center justify-center">
            <span className="text-navy-800 font-display font-bold text-lg leading-none">S</span>
          </div>
          <span className="font-display font-semibold tracking-tight">
            Sunshine State <span className="text-gold-400">Pro</span>
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/70">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#pricing" className="hover:text-white transition">Pricing</a>
          <a href="#faq" className="hover:text-white transition">FAQ</a>
          <a href="#waitlist" className="hover:text-white transition text-gold-400/80 hover:text-gold-400">Join waitlist</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-white/70 hover:text-white">Sign in</Link>
          <Link href="/signup">
            <Button variant="gold" size="sm">Start free</Button>
          </Link>
        </div>
      </nav>

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full bg-gold-400/10 border border-gold-400/30 px-3 py-1 text-xs text-gold-400 mb-6"
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI-powered · Built for Florida service businesses
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] max-w-4xl mx-auto"
        >
          Run your service business{" "}
          <span className="italic text-gold-400">on autopilot</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg text-white/70 max-w-xl mx-auto leading-relaxed"
        >
          Booking, CRM, invoicing, route optimization, and AI follow-ups —
          all in one platform purpose-built for cleaners, detailers, landscapers, and contractors.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex items-center justify-center gap-3"
        >
          <Link href="/signup">
            <Button variant="gold" size="lg" className="group">
              Start 14-day trial
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="bg-white/5 border-white/20 text-white hover:bg-white/10">
            Watch 2-min demo
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-5"
        >
          <a
            href="#waitlist"
            className="text-sm text-white/40 hover:text-gold-400 transition underline underline-offset-4 decoration-white/20 hover:decoration-gold-400/50"
          >
            Not ready yet? Join the waitlist for personal outreach →
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 mx-auto max-w-5xl"
        >
          <div className="glass rounded-2xl p-2 shadow-2xl">
            <div className="rounded-xl bg-navy-900/60 p-6">
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: "MRR", value: "$24,180", trend: "+12.4%", color: "text-emerald-400" },
                  { label: "Jobs today", value: "38", trend: "6 crews active", color: "text-white/60" },
                  { label: "Retention", value: "94%", trend: "AI on", color: "text-gold-400" },
                  { label: "Avg ticket", value: "$287", trend: "+$23", color: "text-emerald-400" },
                ].map((kpi) => (
                  <div key={kpi.label} className="rounded-lg bg-navy-800/60 p-3 text-left">
                    <div className="text-[10px] uppercase tracking-wider text-white/40">{kpi.label}</div>
                    <div className="mt-1 text-xl font-semibold">{kpi.value}</div>
                    <div className={`mt-0.5 text-[10px] ${kpi.color}`}>{kpi.trend}</div>
                  </div>
                ))}
              </div>
              <div className="h-32 rounded-lg bg-navy-800/40 flex items-end px-4 pb-3 gap-1.5">
                {[35, 42, 38, 55, 48, 62, 58, 71, 65, 78, 72, 85, 82, 95].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.8, delay: 0.6 + i * 0.04 }}
                    className="flex-1 rounded-t bg-gradient-to-t from-gold-600 to-gold-400"
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

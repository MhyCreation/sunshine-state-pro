"use client";

import { useActionState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Mail, User, Briefcase, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { captureLeadAction } from "@/lib/actions/leads";
import { Button } from "@/components/ui/button";

const industries = [
  { value: "cleaning", label: "House Cleaning" },
  { value: "airbnb_turnover", label: "Airbnb Turnover" },
  { value: "pressure_washing", label: "Pressure Washing" },
  { value: "mobile_detailing", label: "Mobile Detailing" },
  { value: "landscaping", label: "Landscaping" },
  { value: "home_services", label: "Home Services" },
  { value: "contracting", label: "Contracting" },
  { value: "other", label: "Other" },
];

function FieldWrapper({ children }: { children: React.ReactNode }) {
  return <div className="relative">{children}</div>;
}

function FieldIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
      {children}
    </span>
  );
}

const inputClass =
  "w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-gold-400/60 focus:bg-white/8 transition";

const selectClass =
  "w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-gold-400/60 transition appearance-none [&>option]:bg-navy-900 [&>option]:text-white";

export function LeadCapture() {
  const [state, action, pending] = useActionState(captureLeadAction, null);

  return (
    <section id="waitlist" className="bg-navy-800 text-white py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-gold-400/8 blur-3xl" />
      <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-gold-400/6 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-gold-400/10 border border-gold-400/20 px-3 py-1 text-xs text-gold-400 mb-6">
              Limited early access
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight leading-[1.1] mb-6">
              Get personal outreach from our team{" "}
              <span className="italic text-gold-400">— powered by AI</span>
            </h2>
            <p className="text-white/60 text-lg leading-relaxed mb-8">
              Drop your email or phone and we'll reach out with a message tailored
              to your specific service business. No spam, no mass blasts — just a
              genuine conversation about how Sunshine State Pro fits your operation.
            </p>

            <div className="space-y-4">
              {[
                "Personalized outreach via SMS or email",
                "Priority access when we launch in your area",
                "One-on-one onboarding with a real human",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-white/70">
                  <CheckCircle className="h-4 w-4 text-gold-400 shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-white/10">
              <p className="text-xs text-white/30 uppercase tracking-wider mb-4">Trusted by operators in</p>
              <div className="flex flex-wrap gap-2">
                {["Miami", "Tampa", "Orlando", "Jacksonville", "Fort Lauderdale", "Naples"].map((city) => (
                  <span
                    key={city}
                    className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/50"
                  >
                    {city}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="rounded-2xl bg-white/5 border border-white/10 p-8 backdrop-blur-sm">
              <AnimatePresence mode="wait">
                {state?.success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10"
                  >
                    <div className="h-16 w-16 rounded-full bg-gold-400/15 flex items-center justify-center mx-auto mb-5">
                      <CheckCircle className="h-8 w-8 text-gold-400" />
                    </div>
                    <h3 className="font-display text-2xl font-semibold mb-3">You're on the list</h3>
                    <p className="text-white/60 text-sm leading-relaxed max-w-xs mx-auto">
                      Check your phone or inbox — our AI just drafted a personal note
                      for you and a real human is reviewing it now.
                    </p>
                  </motion.div>
                ) : (
                  <motion.form key="form" action={action} className="space-y-4">
                    <div>
                      <h3 className="font-display text-xl font-semibold mb-1">Join the waitlist</h3>
                      <p className="text-sm text-white/50">We'll reach out personally — no bots.</p>
                    </div>

                    <FieldWrapper>
                      <FieldIcon><User className="h-4 w-4" /></FieldIcon>
                      <input
                        name="name"
                        type="text"
                        placeholder="Your name (optional)"
                        autoComplete="name"
                        className={inputClass}
                      />
                    </FieldWrapper>

                    <FieldWrapper>
                      <FieldIcon><Mail className="h-4 w-4" /></FieldIcon>
                      <input
                        name="email"
                        type="email"
                        placeholder="Email address"
                        autoComplete="email"
                        className={inputClass}
                      />
                    </FieldWrapper>

                    <FieldWrapper>
                      <FieldIcon><Phone className="h-4 w-4" /></FieldIcon>
                      <input
                        name="phone"
                        type="tel"
                        placeholder="Mobile number (for SMS outreach)"
                        autoComplete="tel"
                        className={inputClass}
                      />
                    </FieldWrapper>

                    <FieldWrapper>
                      <FieldIcon><Briefcase className="h-4 w-4" /></FieldIcon>
                      <select name="industry" className={selectClass} defaultValue="">
                        <option value="" disabled>
                          What kind of business? (optional)
                        </option>
                        {industries.map((i) => (
                          <option key={i.value} value={i.value}>
                            {i.label}
                          </option>
                        ))}
                      </select>
                    </FieldWrapper>

                    {state?.error && (
                      <p className="text-red-400 text-sm">{state.error}</p>
                    )}

                    <Button
                      type="submit"
                      variant="gold"
                      size="lg"
                      className="w-full group"
                      disabled={pending}
                    >
                      {pending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          Get personal outreach
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </>
                      )}
                    </Button>

                    <p className="text-center text-[11px] text-white/25 leading-relaxed">
                      By submitting you agree to receive outreach from Sunshine State Pro.
                      Unsubscribe anytime.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

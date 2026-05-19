"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { signupSchema, type SignupInput } from "@/lib/schemas";
import { signupAction } from "@/lib/actions/auth";

const STEP1_FIELDS = ["fullName", "businessName", "industry"] as const;

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

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { industry: "cleaning" },
  });

  const goNext = async () => {
    const valid = await trigger(STEP1_FIELDS);
    if (valid) setStep(2);
  };

  const onSubmit = (data: SignupInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await signupAction(data);
      if (result?.error) setServerError(result.error);
    });
  };

  return (
    <div>
      <Logo />

      {/* Step indicator */}
      <div className="mt-8 mb-7 flex items-center gap-1">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <div
              className={cn(
                "h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300",
                s < step
                  ? "bg-gold-400 text-navy-800"
                  : s === step
                  ? "bg-navy-800 text-gold-400 ring-2 ring-navy-800/20"
                  : "bg-navy-100 text-navy-400"
              )}
            >
              {s < step ? <Check className="h-3.5 w-3.5" /> : s}
            </div>
            <span
              className={cn(
                "text-xs transition-colors",
                s === step ? "text-navy-800 font-medium" : "text-navy-400"
              )}
            >
              {s === 1 ? "Your business" : "Your account"}
            </span>
            {s < 2 && <div className="h-px w-6 bg-navy-100 mx-1" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.22 }}
              className="space-y-4"
            >
              <div>
                <h1 className="font-display text-2xl font-semibold tracking-tight text-navy-800">
                  Tell us about your business
                </h1>
                <p className="mt-1.5 text-sm text-navy-500">14-day free trial. No credit card needed.</p>
              </div>

              <div>
                <label className="text-xs font-medium text-navy-600 mb-1.5 block">Your name</label>
                <Input
                  placeholder="Marcus Reyes"
                  autoComplete="name"
                  autoFocus
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <p className="text-xs text-red-600 mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-navy-600 mb-1.5 block">Business name</label>
                <Input
                  placeholder="Reyes Pressure Washing"
                  autoComplete="organization"
                  {...register("businessName")}
                />
                {errors.businessName && (
                  <p className="text-xs text-red-600 mt-1">{errors.businessName.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-navy-600 mb-1.5 block">Industry</label>
                <select
                  {...register("industry")}
                  className="flex h-11 w-full rounded-md border border-navy-100 bg-white px-3.5 text-sm focus-visible:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition"
                >
                  {industries.map((i) => (
                    <option key={i.value} value={i.value}>
                      {i.label}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type="button"
                variant="gold"
                className="w-full group"
                size="lg"
                onClick={goNext}
              >
                Continue
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22 }}
              className="space-y-4"
            >
              <div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-xs text-navy-400 hover:text-navy-700 mb-4 transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
                <h1 className="font-display text-2xl font-semibold tracking-tight text-navy-800">
                  Create your account
                </h1>
                <p className="mt-1.5 text-sm text-navy-500">Almost there.</p>
              </div>

              <div>
                <label className="text-xs font-medium text-navy-600 mb-1.5 block">Work email</label>
                <Input
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  autoFocus
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-navy-600 mb-1.5 block">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    className="pr-10"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-300 hover:text-navy-600 transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
                )}
              </div>

              {serverError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-xs text-red-700">
                  {serverError}
                </div>
              )}

              <Button
                type="submit"
                variant="gold"
                className="w-full group"
                size="lg"
                disabled={pending}
              >
                {pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Create my workspace
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </Button>

              <p className="text-[11px] text-navy-400 text-center leading-relaxed">
                By creating an account you agree to our{" "}
                <Link href="/#" className="underline hover:text-navy-700">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/#" className="underline hover:text-navy-700">
                  Privacy Policy
                </Link>
                .
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <p className="mt-6 text-sm text-navy-500 text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-navy-800 font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

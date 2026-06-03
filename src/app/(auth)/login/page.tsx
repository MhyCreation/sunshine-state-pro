"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, ArrowRight, Mail } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginInput } from "@/lib/schemas";
import { loginAction, resetPasswordAction } from "@/lib/actions/auth";

export default function LoginPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [pending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await loginAction(data);
      if (result?.error) setServerError(result.error);
    });
  };

  const handleReset = () => {
    if (!resetEmail) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("email", resetEmail);
      await resetPasswordAction(fd);
      setResetSent(true);
    });
  };

  return (
    <AnimatePresence mode="wait">
      {resetMode ? (
        <motion.div
          key="reset"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25 }}
        >
          <Logo />
          <div className="mt-8">
            {resetSent ? (
              <div className="text-center py-6">
                <div className="h-14 w-14 rounded-full bg-gold-50 border border-gold-200 flex items-center justify-center mx-auto mb-5">
                  <Mail className="h-6 w-6 text-gold-600" />
                </div>
                <h2 className="font-display text-xl font-semibold text-navy-800 mb-2">Check your inbox</h2>
                <p className="text-sm text-navy-500 leading-relaxed">
                  We sent a reset link to <span className="font-medium text-navy-800">{resetEmail}</span>.
                  It expires in 1 hour.
                </p>
                <button
                  onClick={() => { setResetMode(false); setResetSent(false); setResetEmail(""); }}
                  className="mt-6 text-sm text-navy-500 underline underline-offset-4 hover:text-navy-800 transition"
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-display text-2xl font-semibold text-navy-800">Reset password</h2>
                <p className="mt-1.5 text-sm text-navy-500">Enter your email and we&apos;ll send a reset link.</p>
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-navy-600 mb-1.5 block">Email</label>
                    <Input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="you@company.com"
                      autoFocus
                    />
                  </div>
                  <Button
                    variant="gold"
                    className="w-full"
                    size="lg"
                    onClick={handleReset}
                    disabled={pending || !resetEmail}
                  >
                    {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
                  </Button>
                </div>
                <button
                  onClick={() => setResetMode(false)}
                  className="mt-5 text-sm text-navy-400 hover:text-navy-700 transition"
                >
                  ← Back to sign in
                </button>
              </>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="login"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <Logo />

          <div className="mt-8">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-navy-800">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-navy-500">Sign in to your Sunshine workspace.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <div>
              <label className="text-xs font-medium text-navy-600 mb-1.5 block">Email</label>
              <Input
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-navy-600">Password</label>
                <button
                  type="button"
                  onClick={() => setResetMode(true)}
                  className="text-xs text-navy-400 hover:text-navy-700 transition"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-300 hover:text-navy-600 transition"
                  tabIndex={-1}
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
                  Sign in
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-sm text-navy-500 text-center">
            New to Sunshine?{" "}
            <Link href="/signup" className="text-navy-800 font-semibold hover:underline">
              Start free trial
            </Link>
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

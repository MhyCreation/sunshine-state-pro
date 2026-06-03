"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (password !== confirm) { setError("Passwords don't match"); return; }

    startTransition(async () => {
      const supabase = createClient();
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) { setError(err.message); return; }
      setDone(true);
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Logo />
      <div className="mt-8">
        {done ? (
          <div className="text-center py-8">
            <div className="h-14 w-14 rounded-full bg-gold-50 border border-gold-200 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="h-7 w-7 text-gold-600" />
            </div>
            <h2 className="font-display text-xl font-semibold text-navy-800 mb-2">Password updated</h2>
            <p className="text-sm text-navy-500 mb-6">You can now sign in with your new password.</p>
            <Button variant="gold" size="lg" className="w-full" onClick={() => window.location.href = "/login"}>
              Sign in
            </Button>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-navy-800">Choose a new password</h1>
            <p className="mt-1.5 text-sm text-navy-500">At least 8 characters.</p>
            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <div>
                <label className="text-xs font-medium text-navy-600 mb-1.5 block">New password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="pr-10"
                    autoFocus
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-300 hover:text-navy-600 transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-navy-600 mb-1.5 block">Confirm password</label>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-xs text-red-700">
                  {error}
                </div>
              )}
              <Button type="submit" variant="gold" className="w-full" size="lg" disabled={pending || !password || !confirm}>
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
              </Button>
            </form>
          </>
        )}
      </div>
    </motion.div>
  );
}

"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { signupSchema, type SignupInput } from "@/lib/schemas";
import { signupAction } from "@/lib/actions/auth";

export default function SignupPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors } } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = (data: SignupInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await signupAction(data);
      if (result?.error) setServerError(result.error);
    });
  };

  return (
    <div>
      <div className="md:hidden mb-8">
        <Logo />
      </div>

      <h1 className="font-display text-3xl font-semibold tracking-tight text-white">Create account</h1>
      <p className="mt-2 text-sm text-white/50">
        Get <span className="text-gold-400 font-medium">10,000 GC</span> +{" "}
        <span className="text-win font-medium">2.00 SC</span> free on signup.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <label className="text-xs font-medium text-white/60 mb-1.5 block">Username</label>
          <Input placeholder="lucky_spinner_99" {...register("username")} />
          {errors.username && <p className="text-xs text-lose mt-1">{errors.username.message}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-white/60 mb-1.5 block">Email</label>
          <Input type="email" placeholder="you@example.com" {...register("email")} />
          {errors.email && <p className="text-xs text-lose mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-white/60 mb-1.5 block">Password</label>
          <Input type="password" placeholder="At least 8 characters" {...register("password")} />
          {errors.password && <p className="text-xs text-lose mt-1">{errors.password.message}</p>}
        </div>
        {serverError && (
          <div className="rounded-md bg-lose/10 border border-lose/30 px-3 py-2 text-xs text-lose">
            {serverError}
          </div>
        )}
        <Button type="submit" variant="gold" className="w-full" size="lg" disabled={pending}>
          {pending ? "Creating account…" : "Claim Free Coins & Play"}
        </Button>
      </form>

      <p className="mt-4 text-xs text-white/30 text-center leading-relaxed">
        By signing up you confirm you are 18+ and agree to our Terms. No purchase necessary. Void where prohibited.
      </p>

      <p className="mt-4 text-sm text-white/50 text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-gold-400 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginInput } from "@/lib/schemas";
import { loginAction } from "@/lib/actions/auth";

export default function LoginPage() {
  const [serverError, setServerError] = useState<string | null>(null);
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

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-navy-800">Welcome back</h1>
      <p className="mt-2 text-sm text-navy-500">Sign in to your Sunshine workspace.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <label className="text-xs font-medium text-navy-600 mb-1.5 block">Email</label>
          <Input type="email" placeholder="you@company.com" {...register("email")} />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-navy-600 mb-1.5 block">Password</label>
          <Input type="password" placeholder="••••••••" {...register("password")} />
          {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
        </div>
        {serverError && (
          <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
            {serverError}
          </div>
        )}
        <Button type="submit" variant="gold" className="w-full" size="lg" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-navy-500 text-center">
        New to Sunshine?{" "}
        <Link href="/signup" className="text-navy-800 font-medium hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

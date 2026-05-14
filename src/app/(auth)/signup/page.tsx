"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signupSchema, type SignupInput } from "@/lib/schemas";
import { signupAction } from "@/lib/actions/auth";

const industries = [
  { value: "cleaning", label: "Cleaning" },
  { value: "airbnb_turnover", label: "Airbnb turnover" },
  { value: "pressure_washing", label: "Pressure washing" },
  { value: "mobile_detailing", label: "Mobile detailing" },
  { value: "landscaping", label: "Landscaping" },
  { value: "home_services", label: "Home services" },
  { value: "contracting", label: "Contracting" },
  { value: "other", label: "Other" },
];

export default function SignupPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors } } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { industry: "cleaning" },
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
      <h1 className="font-display text-3xl font-semibold tracking-tight text-navy-800">
        Start your free trial
      </h1>
      <p className="mt-2 text-sm text-navy-500">14 days. No credit card needed.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-3.5">
        <div>
          <label className="text-xs font-medium text-navy-600 mb-1.5 block">Your name</label>
          <Input placeholder="Marcus Reyes" {...register("fullName")} />
          {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName.message}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-navy-600 mb-1.5 block">Business name</label>
          <Input placeholder="Reyes Pressure Washing" {...register("businessName")} />
          {errors.businessName && <p className="text-xs text-red-600 mt-1">{errors.businessName.message}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-navy-600 mb-1.5 block">Industry</label>
          <select
            {...register("industry")}
            className="flex h-11 w-full rounded-md border border-navy-100 bg-white px-3.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          >
            {industries.map((i) => (
              <option key={i.value} value={i.value}>{i.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-navy-600 mb-1.5 block">Work email</label>
          <Input type="email" placeholder="you@company.com" {...register("email")} />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-navy-600 mb-1.5 block">Password</label>
          <Input type="password" placeholder="At least 8 characters" {...register("password")} />
          {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
        </div>
        {serverError && (
          <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
            {serverError}
          </div>
        )}
        <Button type="submit" variant="gold" className="w-full" size="lg" disabled={pending}>
          {pending ? "Creating workspace…" : "Create my workspace"}
        </Button>
      </form>

      <p className="mt-5 text-sm text-navy-500 text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-navy-800 font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
}

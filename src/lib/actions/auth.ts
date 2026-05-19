"use server";

import { createClient } from "@/lib/supabase/server";
import { signupSchema, loginSchema, type SignupInput, type LoginInput } from "@/lib/schemas";
import { redirect } from "next/navigation";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function signupAction(input: SignupInput) {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
    },
  });

  if (authError || !authData.user) {
    return { error: authError?.message ?? "Could not create account" };
  }

  // 2. Create business (RLS allows authenticated insert)
  const slug = `${slugify(parsed.data.businessName)}-${Math.random().toString(36).slice(2, 6)}`;
  const { data: business, error: bizError } = await supabase
    .from("businesses")
    .insert({
      name: parsed.data.businessName,
      slug,
      industry: parsed.data.industry,
    })
    .select()
    .single();

  if (bizError || !business) {
    return { error: bizError?.message ?? "Could not create business" };
  }

  // 3. Create owner membership (first-member exception in RLS allows this)
  const { error: memberError } = await supabase.from("business_members").insert({
    business_id: business.id,
    user_id: authData.user.id,
    role: "owner",
    full_name: parsed.data.fullName,
  });

  if (memberError) {
    return { error: memberError.message };
  }

  redirect("/dashboard");
}

export async function loginAction(input: LoginInput) {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid email or password" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) return { error: error.message };
  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function resetPasswordAction(formData: FormData) {
  const email = formData.get("email") as string;
  if (!email) return { error: "Email is required" };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  });

  if (error) return { error: error.message };
  return { success: true };
}

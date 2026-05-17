"use server";

import { createClient } from "@/lib/supabase/server";
import { signupSchema, loginSchema, type SignupInput, type LoginInput } from "@/lib/schemas";
import { redirect } from "next/navigation";

export async function signupAction(input: SignupInput) {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { username: parsed.data.username },
    },
  });

  if (authError || !authData.user) {
    return { error: authError?.message ?? "Could not create account" };
  }

  // Profile and wallet are created by the DB trigger; update username
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ username: parsed.data.username })
    .eq("id", authData.user.id);

  if (profileError) {
    // Non-fatal — trigger may not have run yet if email confirmation is pending
    console.error("Profile update error:", profileError.message);
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

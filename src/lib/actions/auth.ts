"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createLocalbase } from "@lb/js";
import {
  signupSchema,
  loginSchema,
  type SignupInput,
  type LoginInput,
} from "@/lib/schemas";

const LB_URL =
  process.env.LOCALBASE_URL ??
  process.env.NEXT_PUBLIC_LOCALBASE_URL ??
  "http://localhost:7700";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function setSessionCookies(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  const store = await cookies();
  const secure = process.env.NODE_ENV === "production";

  store.set("lb_at", accessToken, {
    path: "/",
    maxAge: 15 * 60,
    sameSite: "lax",
    httpOnly: false, // browser needs to read for direct API calls
    secure,
  });
  store.set("lb_rt", refreshToken, {
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
    sameSite: "lax",
    httpOnly: true,
    secure,
  });
}

export async function signupAction(input: SignupInput) {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const lb = createLocalbase({ url: LB_URL });

  // 1. Create the auth user — this sets the token inside the lb instance
  const { data: session, error: authError } = await lb.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    data: { full_name: parsed.data.fullName },
  });

  if (authError || !session?.user) {
    return { error: authError?.message ?? "Could not create account" };
  }

  // 2. Create the business — lb now carries the access token from step 1
  const slug = `${slugify(parsed.data.businessName)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;

  const { data: business, error: bizError } = await lb
    .table<{ id: string; name: string; slug: string; industry?: string }>("businesses")
    .insert({
      name: parsed.data.businessName,
      slug,
      industry: parsed.data.industry,
    });

  if (bizError || !business) {
    return { error: bizError?.message ?? "Could not create business" };
  }

  // 3. Create the owner membership record
  const { error: memberError } = await lb.table("business_members").insert({
    business_id: business.id,
    user_id: session.user.id,
    role: "owner",
    full_name: parsed.data.fullName,
  });

  if (memberError) return { error: memberError.message };

  await setSessionCookies(session.access_token, session.refresh_token);
  redirect("/dashboard");
}

export async function loginAction(input: LoginInput) {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid email or password" };

  const lb = createLocalbase({ url: LB_URL });
  const { data: session, error } = await lb.auth.signIn({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !session) return { error: error?.message ?? "Login failed" };

  await setSessionCookies(session.access_token, session.refresh_token);
  redirect("/dashboard");
}

export async function logoutAction() {
  const store = await cookies();
  const rt = store.get("lb_rt")?.value;

  // Invalidate the refresh token server-side so it cannot be reused
  if (rt) {
    await fetch(`${LB_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: rt }),
    }).catch(() => {});
  }

  store.set("lb_at", "", { path: "/", maxAge: 0 });
  store.set("lb_rt", "", { path: "/", maxAge: 0 });
  redirect("/");
}

"use server";

import { redirect } from "next/navigation";
import { getStripe, PLANS, type Plan } from "@/lib/stripe";
import { createClient } from "@/lib/localbase/server";

const LB_URL =
  process.env.LOCALBASE_URL ??
  process.env.NEXT_PUBLIC_LOCALBASE_URL ??
  "http://localhost:7700";

const LB_API_KEY = process.env.LOCALBASE_API_KEY ?? "";

type Business = {
  id: string;
  name: string;
  plan?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
};
type Membership = { business_id: string; full_name: string; role: string };
type AuthUser = { id: string; email?: string };

async function studioSql(sql: string, params: unknown[] = []) {
  return fetch(`${LB_URL}/studio/api/sql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(LB_API_KEY ? { "X-API-Key": LB_API_KEY } : {}),
    },
    body: JSON.stringify({ sql, params }),
  });
}

// Add billing columns to businesses table if they don't exist yet.
// Called once from the billing page before any other queries.
export async function ensureBillingColumns() {
  const cols = [
    `ALTER TABLE businesses ADD COLUMN plan TEXT NOT NULL DEFAULT 'free'`,
    `ALTER TABLE businesses ADD COLUMN stripe_customer_id TEXT`,
    `ALTER TABLE businesses ADD COLUMN stripe_subscription_id TEXT`,
  ];
  for (const sql of cols) {
    await studioSql(sql).catch(() => {});
  }
}

export async function getBusinessPlan(): Promise<{
  business: Business;
  plan: Plan;
} | null> {
  const lb = await createClient();
  const { data: user } = (await lb.auth.getUser()) as {
    data: AuthUser | null;
    error: unknown;
  };
  if (!user) return null;

  const { data: rows } = await lb
    .table<Membership>("business_members")
    .query()
    .where({ user_id: user.id })
    .limit(1)
    .run();

  const membership = rows?.[0];
  if (!membership) return null;

  const { data: business } = await lb
    .table<Business>("businesses")
    .get(membership.business_id);

  if (!business) return null;

  const plan = (business.plan ?? "free") as Plan;
  return { business, plan };
}

export async function createCheckoutSession(formData: FormData) {
  const plan = formData.get("plan") as string;
  if (plan !== "pro") return;

  const lb = await createClient();
  const { data: user } = (await lb.auth.getUser()) as {
    data: AuthUser | null;
    error: unknown;
  };
  if (!user) redirect("/login");

  const { data: rows } = await lb
    .table<Membership>("business_members")
    .query()
    .where({ user_id: user.id })
    .limit(1)
    .run();

  const membership = rows?.[0];
  if (!membership) redirect("/dashboard");

  const { data: business } = await lb
    .table<Business>("businesses")
    .get(membership.business_id);

  if (!business) redirect("/dashboard");

  let customerId = business.stripe_customer_id;
  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: user.email,
      name: business.name,
      metadata: { business_id: business.id },
    });
    customerId = customer.id;
    await lb
      .table<Business>("businesses")
      .update(business.id, { stripe_customer_id: customerId });
  }

  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: PLANS.pro.priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    metadata: { business_id: business.id },
  });

  redirect(session.url!);
}

export async function createPortalSession() {
  const lb = await createClient();
  const { data: user } = (await lb.auth.getUser()) as {
    data: AuthUser | null;
    error: unknown;
  };
  if (!user) redirect("/login");

  const { data: rows } = await lb
    .table<Membership>("business_members")
    .query()
    .where({ user_id: user.id })
    .limit(1)
    .run();

  const membership = rows?.[0];
  if (!membership) redirect("/dashboard/billing");

  const { data: business } = await lb
    .table<Business>("businesses")
    .get(membership.business_id);

  if (!business?.stripe_customer_id) redirect("/dashboard/billing");

  const session = await getStripe().billingPortal.sessions.create({
    customer: business.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
  });

  redirect(session.url);
}

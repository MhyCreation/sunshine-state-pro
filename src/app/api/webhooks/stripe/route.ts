import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

const LB_URL =
  process.env.LOCALBASE_URL ??
  process.env.NEXT_PUBLIC_LOCALBASE_URL ??
  "http://localhost:7700";

const LB_API_KEY = process.env.LOCALBASE_API_KEY ?? "";

async function updateBusiness(id: string, fields: Record<string, unknown>) {
  const setClauses = Object.keys(fields)
    .map((k) => `${k} = ?`)
    .join(", ");
  const values = [...Object.values(fields), id];
  return fetch(`${LB_URL}/studio/api/sql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(LB_API_KEY ? { "X-API-Key": LB_API_KEY } : {}),
    },
    body: JSON.stringify({
      sql: `UPDATE businesses SET ${setClauses} WHERE id = ?`,
      params: values,
    }),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const businessId = session.metadata?.business_id;
      if (!businessId || !session.subscription) break;
      await updateBusiness(businessId, {
        plan: "pro",
        stripe_subscription_id: session.subscription as string,
      });
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customer = (await getStripe().customers.retrieve(
        sub.customer as string
      )) as Stripe.Customer;
      const businessId = customer.metadata?.business_id;
      if (!businessId) break;
      const active = ["active", "trialing", "past_due"].includes(sub.status);
      await updateBusiness(businessId, { plan: active ? "pro" : "free" });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customer = (await getStripe().customers.retrieve(
        sub.customer as string
      )) as Stripe.Customer;
      const businessId = customer.metadata?.business_id;
      if (!businessId) break;
      await updateBusiness(businessId, {
        plan: "free",
        stripe_subscription_id: null,
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}

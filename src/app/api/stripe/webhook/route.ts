import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { confirmPurchaseUtil, PURCHASE_PACKS, type PurchasePackId } from "@/lib/purchase-utils";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!stripe) return NextResponse.json({ error: "Payments not configured" }, { status: 500 });

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "payment_intent.succeeded") {
    return NextResponse.json({ received: true });
  }

  const intent = event.data.object;
  const { userId, packId } = intent.metadata;

  if (!userId || !packId || !(packId in PURCHASE_PACKS)) {
    return NextResponse.json({ received: true });
  }

  await confirmPurchaseUtil(userId, packId as PurchasePackId, intent.id);
  return NextResponse.json({ received: true });
}

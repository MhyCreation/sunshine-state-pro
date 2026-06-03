import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export const PURCHASE_PACKS = {
  starter: { name: "Starter Bundle",  usdCents:   99, gcTotal:   5_000, scBonus: 0.10 },
  classic: { name: "Classic Bundle",  usdCents:  299, gcTotal:  15_000, scBonus: 0.25 },
  popular: { name: "Popular Bundle",  usdCents:  499, gcTotal:  35_000, scBonus: 0.50 },
  premium: { name: "Premium Bundle",  usdCents:  999, gcTotal:  80_000, scBonus: 1.00 },
  elite:   { name: "Elite Bundle",    usdCents: 2499, gcTotal: 225_000, scBonus: 2.50 },
  jackpot: { name: "Jackpot Bundle",  usdCents: 4999, gcTotal: 500_000, scBonus: 5.00 },
} as const;

export type PurchasePackId = keyof typeof PURCHASE_PACKS;

export async function createPaymentIntentUtil(
  userId: string,
  packId: PurchasePackId
): Promise<{ clientSecret: string | null; error?: string }> {
  if (!stripe) return { clientSecret: null, error: "Payments not configured" };
  const pack = PURCHASE_PACKS[packId];
  const intent = await stripe.paymentIntents.create({
    amount: pack.usdCents,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    metadata: { userId, packId, gcTotal: pack.gcTotal, scBonus: pack.scBonus },
    description: `SunshineSpins — ${pack.name}`,
  });
  return { clientSecret: intent.client_secret };
}

export async function confirmPurchaseUtil(
  userId: string,
  packId: PurchasePackId,
  paymentIntentId: string
): Promise<{ success: boolean; error?: string; gcAwarded?: number }> {
  if (!stripe) return { success: false, error: "Payments not configured" };

  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (intent.status !== "succeeded") return { success: false, error: "Payment not completed" };
  if (intent.metadata.userId !== userId || intent.metadata.packId !== packId) {
    return { success: false, error: "Payment verification failed" };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("transactions").select("id").eq("user_id", userId)
    .eq("description", `Gold Coin purchase — ${paymentIntentId}`).maybeSingle();
  if (existing) return { success: true, gcAwarded: 0 };

  const pack = PURCHASE_PACKS[packId];
  const { data: wallet } = await supabase.from("wallets").select("gold_coins, sweeps_coins").eq("user_id", userId).single();
  if (!wallet) return { success: false, error: "Wallet not found" };

  const newGc = wallet.gold_coins + pack.gcTotal;
  const newSc = parseFloat((Number(wallet.sweeps_coins) + pack.scBonus).toFixed(2));

  await supabase.from("wallets").update({ gold_coins: newGc, sweeps_coins: newSc }).eq("user_id", userId);
  await supabase.from("transactions").insert([
    { user_id: userId, type: "purchase", currency: "gold", amount: pack.gcTotal, balance_after: newGc, description: `Gold Coin purchase — ${paymentIntentId}` },
    { user_id: userId, type: "bonus", currency: "sweeps", amount: pack.scBonus, balance_after: newSc, description: `Free SC bonus with ${pack.name}` },
  ]);

  return { success: true, gcAwarded: pack.gcTotal };
}

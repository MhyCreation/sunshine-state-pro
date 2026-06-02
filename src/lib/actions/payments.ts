"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { createPaymentIntentUtil, confirmPurchaseUtil, PURCHASE_PACKS } from "@/lib/purchase-utils";

export { PURCHASE_PACKS };
export type { PurchasePackId } from "@/lib/purchase-utils";

export async function createPaymentIntent(
  packId: import("@/lib/purchase-utils").PurchasePackId
): Promise<{ clientSecret: string | null; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { clientSecret: null, error: "Not authenticated" };
  return createPaymentIntentUtil(user.id, packId);
}

export async function confirmGoldCoinPurchase(
  packId: import("@/lib/purchase-utils").PurchasePackId,
  paymentIntentId: string
): Promise<{ success: boolean; error?: string; gcAwarded?: number }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };
  const result = await confirmPurchaseUtil(user.id, packId, paymentIntentId);
  if (result.success) { revalidatePath("/shop"); revalidatePath("/wallet"); }
  return result;
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { confirmPurchaseUtil, PURCHASE_PACKS, type PurchasePackId } from "@/lib/purchase-utils";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { packId, paymentIntentId } = await req.json();
  if (!packId || !(packId in PURCHASE_PACKS) || !paymentIntentId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const result = await confirmPurchaseUtil(user.id, packId as PurchasePackId, paymentIntentId);
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ gcAwarded: result.gcAwarded });
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPaymentIntentUtil, PURCHASE_PACKS, type PurchasePackId } from "@/lib/purchase-utils";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { packId } = await req.json();
  if (!packId || !(packId in PURCHASE_PACKS)) {
    return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
  }

  const result = await createPaymentIntentUtil(user.id, packId as PurchasePackId);
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json({ clientSecret: result.clientSecret });
}

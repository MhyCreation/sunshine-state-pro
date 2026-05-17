"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getWallet() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("wallets")
    .select("gold_coins, sweeps_coins")
    .eq("user_id", user.id)
    .single();

  return data;
}

export async function claimDailyBonus(): Promise<{ success: boolean; error?: string; gold?: number; sweeps?: number }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const today = new Date().toISOString().split("T")[0];

  // Check if already claimed
  const { data: existing } = await supabase
    .from("daily_bonuses")
    .select("id")
    .eq("user_id", user.id)
    .eq("claimed_date", today)
    .maybeSingle();

  if (existing) {
    return { success: false, error: "Already claimed today" };
  }

  const goldAward = 1000;
  const sweepsAward = 0.5;

  // Record bonus
  const { error: bonusError } = await supabase.from("daily_bonuses").insert({
    user_id: user.id,
    claimed_date: today,
    gold_awarded: goldAward,
    sweeps_awarded: sweepsAward,
  });

  if (bonusError) return { success: false, error: bonusError.message };

  // Update wallet
  const { data: wallet, error: walletError } = await supabase
    .from("wallets")
    .select("gold_coins, sweeps_coins")
    .eq("user_id", user.id)
    .single();

  if (walletError || !wallet) return { success: false, error: "Wallet not found" };

  await supabase
    .from("wallets")
    .update({
      gold_coins: wallet.gold_coins + goldAward,
      sweeps_coins: parseFloat((Number(wallet.sweeps_coins) + sweepsAward).toFixed(2)),
    })
    .eq("user_id", user.id);

  // Record transactions
  await supabase.from("transactions").insert([
    {
      user_id: user.id,
      type: "daily_login",
      currency: "gold",
      amount: goldAward,
      balance_after: wallet.gold_coins + goldAward,
      description: "Daily login bonus",
    },
    {
      user_id: user.id,
      type: "daily_login",
      currency: "sweeps",
      amount: sweepsAward,
      balance_after: parseFloat((Number(wallet.sweeps_coins) + sweepsAward).toFixed(2)),
      description: "Daily login bonus",
    },
  ]);

  revalidatePath("/dashboard");
  return { success: true, gold: goldAward, sweeps: sweepsAward };
}

export async function getRecentTransactions(limit = 20) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}

export async function getStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: wallet } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { count: sessionCount } = await supabase
    .from("game_sessions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return { wallet, sessionCount: sessionCount ?? 0 };
}

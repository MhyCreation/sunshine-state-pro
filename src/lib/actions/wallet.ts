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

export async function purchaseGoldCoins(
  packId: string
): Promise<{ success: boolean; goldAwarded?: number; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Pack definitions (must match client-side PACKS)
  const PACKS: Record<string, { scCost: number; gcTotal: number; label: string }> = {
    starter:  { scCost: 0.10, gcTotal:   5_000, label: "Starter Bundle" },
    classic:  { scCost: 0.25, gcTotal:  15_000, label: "Classic Bundle" },
    popular:  { scCost: 0.50, gcTotal:  35_000, label: "Popular Bundle" },
    premium:  { scCost: 1.00, gcTotal:  80_000, label: "Premium Bundle" },
    elite:    { scCost: 2.50, gcTotal: 225_000, label: "Elite Bundle" },
    jackpot:  { scCost: 5.00, gcTotal: 500_000, label: "Jackpot Bundle" },
  };

  const pack = PACKS[packId];
  if (!pack) return { success: false, error: "Invalid pack" };

  const { data: wallet, error: walletError } = await supabase
    .from("wallets")
    .select("gold_coins, sweeps_coins")
    .eq("user_id", user.id)
    .single();

  if (walletError || !wallet) return { success: false, error: "Wallet not found" };

  const currentSc = parseFloat(String(wallet.sweeps_coins));
  if (currentSc < pack.scCost) {
    return { success: false, error: "Insufficient Sweeps Coins" };
  }

  const newSc = parseFloat((currentSc - pack.scCost).toFixed(2));
  const newGc = wallet.gold_coins + pack.gcTotal;

  const { error: updateError } = await supabase
    .from("wallets")
    .update({ gold_coins: newGc, sweeps_coins: newSc })
    .eq("user_id", user.id);

  if (updateError) return { success: false, error: updateError.message };

  // Two transaction records: SC deducted, GC credited
  await supabase.from("transactions").insert([
    {
      user_id: user.id,
      type: "purchase",
      currency: "sweeps",
      amount: -pack.scCost,
      balance_after: newSc,
      description: `${pack.label} — SC spent`,
    },
    {
      user_id: user.id,
      type: "purchase",
      currency: "gold",
      amount: pack.gcTotal,
      balance_after: newGc,
      description: `${pack.label} — GC received`,
    },
  ]);

  revalidatePath("/shop");
  revalidatePath("/wallet");
  return { success: true, goldAwarded: pack.gcTotal };
}

const MIN_REDEMPTION_SC = 100;

export async function getRedemptionEligibility(): Promise<{ hasPlayedWithSC: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hasPlayedWithSC: false };

  const { count } = await supabase
    .from("game_sessions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("currency", "sweeps");

  return { hasPlayedWithSC: (count ?? 0) > 0 };
}

export async function requestRedemption(
  amount: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  if (!Number.isFinite(amount) || amount < MIN_REDEMPTION_SC) {
    return { success: false, error: `Minimum redemption is ${MIN_REDEMPTION_SC} SC` };
  }

  // Must have wagered SC at least once before redeeming
  const { count: scSessionCount } = await supabase
    .from("game_sessions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("currency", "sweeps");

  if (!scSessionCount || scSessionCount === 0) {
    return { success: false, error: "You must play at least one game with Sweeps Coins before redeeming" };
  }

  const { data: wallet, error: walletError } = await supabase
    .from("wallets")
    .select("sweeps_coins")
    .eq("user_id", user.id)
    .single();

  if (walletError || !wallet) return { success: false, error: "Wallet not found" };

  const currentSc = parseFloat(String(wallet.sweeps_coins));
  if (currentSc < amount) return { success: false, error: "Insufficient Sweeps Coins" };

  const newSc = parseFloat((currentSc - amount).toFixed(2));

  const { error: updateError } = await supabase
    .from("wallets")
    .update({ sweeps_coins: newSc })
    .eq("user_id", user.id);

  if (updateError) return { success: false, error: updateError.message };

  await supabase.from("transactions").insert({
    user_id: user.id,
    type: "redemption",
    currency: "sweeps",
    amount: -amount,
    balance_after: newSc,
    description: `Redemption request — ${amount.toFixed(2)} SC`,
  });

  revalidatePath("/wallet");
  return { success: true };
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

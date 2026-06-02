"use server";

import { createClient } from "@/lib/supabase/server";

export type GameType = "slots" | "blackjack" | "poker" | "roulette" | "keno" | "crash" | "baccarat" | "mines";
export type CurrencyType = "gold" | "sweeps";

export async function placeBet(
  game: GameType,
  currency: CurrencyType,
  betAmount: number
): Promise<{ sessionId: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { sessionId: "", error: "Not authenticated" };

  // Validate minimum bets
  if (currency === "gold" && betAmount < 100) {
    return { sessionId: "", error: "Minimum bet is 100 GC" };
  }
  if (currency === "sweeps" && betAmount < 0.1) {
    return { sessionId: "", error: "Minimum bet is 0.10 SC" };
  }

  // Fetch wallet
  const { data: wallet, error: walletError } = await supabase
    .from("wallets")
    .select("gold_coins, sweeps_coins")
    .eq("user_id", user.id)
    .single();

  if (walletError || !wallet) return { sessionId: "", error: "Wallet not found" };

  // Check balance
  if (currency === "gold" && wallet.gold_coins < betAmount) {
    return { sessionId: "", error: "Insufficient Gold Coins" };
  }
  if (currency === "sweeps" && Number(wallet.sweeps_coins) < betAmount) {
    return { sessionId: "", error: "Insufficient Sweeps Coins" };
  }

  // Deduct bet
  const updateData =
    currency === "gold"
      ? { gold_coins: wallet.gold_coins - betAmount }
      : { sweeps_coins: parseFloat((Number(wallet.sweeps_coins) - betAmount).toFixed(2)) };

  const { error: updateError } = await supabase
    .from("wallets")
    .update(updateData)
    .eq("user_id", user.id);

  if (updateError) return { sessionId: "", error: updateError.message };

  // Record bet transaction
  await supabase.from("transactions").insert({
    user_id: user.id,
    type: "bet",
    currency,
    amount: -betAmount,
    balance_after: currency === "gold"
      ? wallet.gold_coins - betAmount
      : parseFloat((Number(wallet.sweeps_coins) - betAmount).toFixed(2)),
    description: `${game} bet`,
    game,
  });

  // Create session
  const { data: session, error: sessionError } = await supabase
    .from("game_sessions")
    .insert({
      user_id: user.id,
      game,
      currency,
      bet_amount: betAmount,
      win_amount: 0,
    })
    .select("id")
    .single();

  if (sessionError || !session) return { sessionId: "", error: sessionError?.message };

  return { sessionId: session.id };
}

export async function recordWin(
  sessionId: string,
  winAmount: number,
  resultData?: Record<string, unknown>
): Promise<{ error?: string }> {
  if (!sessionId || winAmount < 0) return { error: "Invalid input" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Fetch session to get currency/game info
  const { data: session, error: sessionError } = await supabase
    .from("game_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (sessionError || !session) return { error: "Session not found" };

  // Update session
  await supabase
    .from("game_sessions")
    .update({ win_amount: winAmount, result_data: resultData ?? null })
    .eq("id", sessionId);

  if (winAmount === 0) return {};

  // Credit winnings to wallet
  const { data: wallet } = await supabase
    .from("wallets")
    .select("gold_coins, sweeps_coins, lifetime_gc_won, lifetime_sc_won")
    .eq("user_id", user.id)
    .single();

  if (!wallet) return { error: "Wallet not found" };

  const currency: CurrencyType = session.currency;
  const updateData =
    currency === "gold"
      ? {
          gold_coins: wallet.gold_coins + winAmount,
          lifetime_gc_won: wallet.lifetime_gc_won + winAmount,
        }
      : {
          sweeps_coins: parseFloat((Number(wallet.sweeps_coins) + winAmount).toFixed(2)),
          lifetime_sc_won: parseFloat(
            (Number(wallet.lifetime_sc_won) + winAmount).toFixed(2)
          ),
        };

  await supabase.from("wallets").update(updateData).eq("user_id", user.id);

  // Record win transaction
  await supabase.from("transactions").insert({
    user_id: user.id,
    type: "win",
    currency,
    amount: winAmount,
    balance_after:
      currency === "gold"
        ? wallet.gold_coins + winAmount
        : parseFloat((Number(wallet.sweeps_coins) + winAmount).toFixed(2)),
    description: `${session.game} win`,
    game: session.game,
  });

  return {};
}

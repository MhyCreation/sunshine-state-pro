import { supabase } from './supabase';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function createMobilePaymentIntent(
  packId: string
): Promise<{ clientSecret: string | null; error?: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { clientSecret: null, error: 'Not authenticated' };

  const res = await fetch(`${API_BASE}/api/stripe/payment-intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ packId }),
  });
  const json = await res.json();
  if (!res.ok) return { clientSecret: null, error: json.error ?? 'Failed to create payment' };
  return { clientSecret: json.clientSecret };
}

export async function confirmMobilePurchase(
  packId: string, paymentIntentId: string
): Promise<{ success: boolean; gcAwarded?: number; error?: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: 'Not authenticated' };

  const res = await fetch(`${API_BASE}/api/stripe/confirm-purchase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ packId, paymentIntentId }),
  });
  const json = await res.json();
  if (!res.ok) return { success: false, error: json.error ?? 'Confirmation failed' };
  return { success: true, gcAwarded: json.gcAwarded };
}

export type GameType = 'slots' | 'blackjack' | 'poker' | 'roulette' | 'keno' | 'crash' | 'baccarat' | 'mines' | 'plinko' | 'dice' | 'wheel' | 'hilo' | 'dragon-tiger' | 'limbo' | 'war' | 'coinflip';
export type CurrencyType = 'gold' | 'sweeps';

export async function getWallet() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('wallets')
    .select('gold_coins, sweeps_coins, lifetime_gc_won, lifetime_sc_won')
    .eq('user_id', user.id)
    .single();
  return data;
}

export async function claimDailyBonus(): Promise<{ success: boolean; error?: string; gold?: number; sweeps?: number }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const today = new Date().toISOString().split('T')[0];
  const { data: existing } = await supabase
    .from('daily_bonuses').select('id').eq('user_id', user.id).eq('claimed_date', today).maybeSingle();
  if (existing) return { success: false, error: 'Already claimed today' };

  const goldAward = 1000;
  const sweepsAward = 0.5;

  const { error: bonusError } = await supabase.from('daily_bonuses').insert({
    user_id: user.id, claimed_date: today, gold_awarded: goldAward, sweeps_awarded: sweepsAward,
  });
  if (bonusError) return { success: false, error: bonusError.message };

  const { data: wallet } = await supabase
    .from('wallets').select('gold_coins, sweeps_coins').eq('user_id', user.id).single();
  if (!wallet) return { success: false, error: 'Wallet not found' };

  await supabase.from('wallets').update({
    gold_coins: wallet.gold_coins + goldAward,
    sweeps_coins: parseFloat((Number(wallet.sweeps_coins) + sweepsAward).toFixed(2)),
  }).eq('user_id', user.id);

  await supabase.from('transactions').insert([
    { user_id: user.id, type: 'daily_login', currency: 'gold', amount: goldAward,
      balance_after: wallet.gold_coins + goldAward, description: 'Daily login bonus' },
    { user_id: user.id, type: 'daily_login', currency: 'sweeps', amount: sweepsAward,
      balance_after: parseFloat((Number(wallet.sweeps_coins) + sweepsAward).toFixed(2)), description: 'Daily login bonus' },
  ]);

  return { success: true, gold: goldAward, sweeps: sweepsAward };
}

export async function getRecentTransactions(limit = 20) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from('transactions').select('*').eq('user_id', user.id)
    .order('created_at', { ascending: false }).limit(limit);
  return data ?? [];
}

export async function placeBet(
  game: GameType, currency: CurrencyType, betAmount: number
): Promise<{ sessionId: string; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { sessionId: '', error: 'Not authenticated' };
  if (currency === 'gold' && betAmount < 100) return { sessionId: '', error: 'Minimum bet is 100 GC' };
  if (currency === 'sweeps' && betAmount < 0.1) return { sessionId: '', error: 'Minimum bet is 0.10 SC' };

  const { data: wallet, error: walletError } = await supabase
    .from('wallets').select('gold_coins, sweeps_coins').eq('user_id', user.id).single();
  if (walletError || !wallet) return { sessionId: '', error: 'Wallet not found' };
  if (currency === 'gold' && wallet.gold_coins < betAmount) return { sessionId: '', error: 'Insufficient Gold Coins' };
  if (currency === 'sweeps' && Number(wallet.sweeps_coins) < betAmount) return { sessionId: '', error: 'Insufficient Sweeps Coins' };

  const updateData = currency === 'gold'
    ? { gold_coins: wallet.gold_coins - betAmount }
    : { sweeps_coins: parseFloat((Number(wallet.sweeps_coins) - betAmount).toFixed(2)) };

  const { error: updateError } = await supabase.from('wallets').update(updateData).eq('user_id', user.id);
  if (updateError) return { sessionId: '', error: updateError.message };

  await supabase.from('transactions').insert({
    user_id: user.id, type: 'bet', currency, amount: -betAmount,
    balance_after: currency === 'gold'
      ? wallet.gold_coins - betAmount
      : parseFloat((Number(wallet.sweeps_coins) - betAmount).toFixed(2)),
    description: `${game} bet`, game,
  });

  const { data: session, error: sessionError } = await supabase
    .from('game_sessions')
    .insert({ user_id: user.id, game, currency, bet_amount: betAmount, win_amount: 0 })
    .select('id').single();
  if (sessionError || !session) return { sessionId: '', error: sessionError?.message };

  return { sessionId: session.id };
}

export async function recordWin(
  sessionId: string, winAmount: number, resultData?: Record<string, unknown>
): Promise<{ error?: string }> {
  if (!sessionId || winAmount < 0) return { error: 'Invalid input' };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: session, error: sessionError } = await supabase
    .from('game_sessions').select('*').eq('id', sessionId).eq('user_id', user.id).single();
  if (sessionError || !session) return { error: 'Session not found' };

  await supabase.from('game_sessions')
    .update({ win_amount: winAmount, result_data: resultData ?? null }).eq('id', sessionId);
  if (winAmount === 0) return {};

  const { data: wallet } = await supabase
    .from('wallets').select('gold_coins, sweeps_coins, lifetime_gc_won, lifetime_sc_won')
    .eq('user_id', user.id).single();
  if (!wallet) return { error: 'Wallet not found' };

  const currency: CurrencyType = session.currency;
  const updateData = currency === 'gold'
    ? { gold_coins: wallet.gold_coins + winAmount, lifetime_gc_won: wallet.lifetime_gc_won + winAmount }
    : {
        sweeps_coins: parseFloat((Number(wallet.sweeps_coins) + winAmount).toFixed(2)),
        lifetime_sc_won: parseFloat((Number(wallet.lifetime_sc_won) + winAmount).toFixed(2)),
      };

  await supabase.from('wallets').update(updateData).eq('user_id', user.id);
  await supabase.from('transactions').insert({
    user_id: user.id, type: 'win', currency, amount: winAmount,
    balance_after: currency === 'gold'
      ? wallet.gold_coins + winAmount
      : parseFloat((Number(wallet.sweeps_coins) + winAmount).toFixed(2)),
    description: `${session.game} win`, game: session.game,
  });

  return {};
}

export async function getRedemptionEligibility(): Promise<{ hasPlayedWithSC: boolean }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hasPlayedWithSC: false };

  const { count } = await supabase
    .from('game_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('currency', 'sweeps');

  return { hasPlayedWithSC: (count ?? 0) > 0 };
}

export async function requestRedemption(
  amount: number
): Promise<{ success: boolean; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  if (!Number.isFinite(amount) || amount < 100) {
    return { success: false, error: 'Minimum redemption is 100 SC' };
  }

  const { count: scSessionCount } = await supabase
    .from('game_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('currency', 'sweeps');

  if (!scSessionCount || scSessionCount === 0) {
    return { success: false, error: 'You must play at least one game with Sweeps Coins before redeeming' };
  }

  const { data: wallet } = await supabase
    .from('wallets').select('sweeps_coins').eq('user_id', user.id).single();
  if (!wallet) return { success: false, error: 'Wallet not found' };

  const currentSc = parseFloat(String(wallet.sweeps_coins));
  if (currentSc < amount) return { success: false, error: 'Insufficient Sweeps Coins' };

  const newSc = parseFloat((currentSc - amount).toFixed(2));
  const { error: updateError } = await supabase
    .from('wallets').update({ sweeps_coins: newSc }).eq('user_id', user.id);
  if (updateError) return { success: false, error: updateError.message };

  await supabase.from('transactions').insert({
    user_id: user.id,
    type: 'redemption',
    currency: 'sweeps',
    amount: -amount,
    balance_after: newSc,
    description: `Redemption request — ${amount.toFixed(2)} SC`,
  });

  return { success: true };
}

export async function purchaseGoldCoins(packId: string): Promise<{ success: boolean; goldAwarded?: number; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const PACKS: Record<string, { scCost: number; gcTotal: number; label: string }> = {
    starter: { scCost: 0.10, gcTotal:   5_000, label: 'Starter Bundle' },
    classic: { scCost: 0.25, gcTotal:  15_000, label: 'Classic Bundle' },
    popular: { scCost: 0.50, gcTotal:  35_000, label: 'Popular Bundle' },
    premium: { scCost: 1.00, gcTotal:  80_000, label: 'Premium Bundle' },
    elite:   { scCost: 2.50, gcTotal: 225_000, label: 'Elite Bundle' },
    jackpot: { scCost: 5.00, gcTotal: 500_000, label: 'Jackpot Bundle' },
  };

  const pack = PACKS[packId];
  if (!pack) return { success: false, error: 'Invalid pack' };

  const { data: wallet } = await supabase
    .from('wallets').select('gold_coins, sweeps_coins').eq('user_id', user.id).single();
  if (!wallet) return { success: false, error: 'Wallet not found' };

  const currentSc = parseFloat(String(wallet.sweeps_coins));
  if (currentSc < pack.scCost) return { success: false, error: 'Insufficient Sweeps Coins' };

  const newSc = parseFloat((currentSc - pack.scCost).toFixed(2));
  const newGc = wallet.gold_coins + pack.gcTotal;

  const { error: updateError } = await supabase.from('wallets')
    .update({ gold_coins: newGc, sweeps_coins: newSc }).eq('user_id', user.id);
  if (updateError) return { success: false, error: updateError.message };

  await supabase.from('transactions').insert([
    { user_id: user.id, type: 'purchase', currency: 'sweeps', amount: -pack.scCost,
      balance_after: newSc, description: `${pack.label} — SC spent` },
    { user_id: user.id, type: 'purchase', currency: 'gold', amount: pack.gcTotal,
      balance_after: newGc, description: `${pack.label} — GC received` },
  ]);

  return { success: true, goldAwarded: pack.gcTotal };
}

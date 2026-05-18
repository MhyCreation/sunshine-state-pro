"use client";

import { useState } from "react";
import { requestRedemption } from "@/lib/actions/wallet";

const MIN_SC = 100;

export function RedemptionForm({
  sweepsCoins,
  hasPlayedWithSC,
}: {
  sweepsCoins: number;
  hasPlayedWithSC: boolean;
}) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const parsed = parseFloat(amount);
  const isValid = Number.isFinite(parsed) && parsed >= MIN_SC && parsed <= sweepsCoins;
  const canSubmit = isValid && !loading;
  const belowMinimum = sweepsCoins < MIN_SC;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    const result = await requestRedemption(parsed);
    setLoading(false);
    if (result.success) {
      setSuccess(true);
      setAmount("");
    } else {
      setError(result.error ?? "Redemption failed");
    }
  }

  if (success) {
    return (
      <div className="bg-casino-800 rounded-xl border border-win/30 p-5 text-center space-y-2">
        <div className="text-3xl">🎉</div>
        <p className="text-win font-semibold text-sm">Redemption request submitted!</p>
        <p className="text-white/40 text-xs">We&apos;ll process your request within 3–5 business days.</p>
        <button
          className="mt-2 text-xs text-white/40 underline underline-offset-2 hover:text-white/60 transition-colors"
          onClick={() => setSuccess(false)}
        >
          Submit another
        </button>
      </div>
    );
  }

  // Locked: must play with SC first
  if (!hasPlayedWithSC) {
    return (
      <div className="bg-casino-800 rounded-xl border border-casino-600 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-sm">Redeem Sweeps Coins</h3>
          <span className="text-xs text-white/40">Min. {MIN_SC} SC</span>
        </div>
        <div className="bg-casino-700 rounded-lg px-4 py-4 flex flex-col items-center gap-2 text-center">
          <span className="text-2xl">🔒</span>
          <p className="text-white/70 text-sm font-medium">Play with SC first</p>
          <p className="text-white/35 text-xs leading-relaxed">
            You must wager Sweeps Coins in at least one game before redeeming.
            Head to any game and select <span className="text-gold-400">💎 Sweeps</span> mode to unlock withdrawals.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-casino-800 rounded-xl border border-casino-600 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm">Redeem Sweeps Coins</h3>
        <span className="text-xs text-white/40">Min. {MIN_SC} SC</span>
      </div>

      {belowMinimum ? (
        <div className="text-xs text-white/40 bg-casino-700 rounded-lg px-4 py-3 text-center">
          You need at least <span className="text-gold-400 font-semibold">{MIN_SC} SC</span> to redeem.
          Keep playing to earn more Sweeps Coins!
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">💎</span>
            <input
              type="number"
              min={MIN_SC}
              max={sweepsCoins}
              step="0.01"
              value={amount}
              onChange={e => { setAmount(e.target.value); setError(null); }}
              placeholder={`${MIN_SC}.00`}
              disabled={loading}
              className="w-full bg-casino-700 border border-casino-500 rounded-lg pl-8 pr-16 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-gold-400/50 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setAmount(sweepsCoins.toFixed(2))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gold-400/70 hover:text-gold-400 transition-colors"
            >
              MAX
            </button>
          </div>

          {parsed > 0 && parsed < MIN_SC && (
            <p className="text-xs text-lose">Minimum redemption is {MIN_SC} SC</p>
          )}
          {parsed > sweepsCoins && (
            <p className="text-xs text-lose">Exceeds your balance ({sweepsCoins.toFixed(2)} SC)</p>
          )}
          {error && <p className="text-xs text-lose">{error}</p>}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all
              bg-gradient-to-r from-gold-300 to-gold-500 text-casino-900
              disabled:opacity-40 disabled:cursor-not-allowed
              enabled:hover:brightness-110 enabled:active:scale-[0.98]"
          >
            {loading ? "Submitting…" : `Redeem ${Number.isFinite(parsed) && parsed >= MIN_SC ? parsed.toFixed(2) + " SC" : "SC"}`}
          </button>
        </form>
      )}
    </div>
  );
}

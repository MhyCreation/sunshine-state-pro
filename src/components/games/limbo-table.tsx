"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useWalletStore, type Currency } from "@/lib/store";
import { placeBet, recordWin } from "@/lib/actions/games";
import { Button } from "@/components/ui/button";

const BET_GC = [100, 250, 500, 1000, 2500];
const BET_SC = [0.1, 0.25, 0.5, 1, 2.5];
const TARGET_OPTIONS = [1.5, 2, 3, 5, 10, 25, 50, 100];

function generateResult(): number {
  const r = Math.random();
  if (r < 0.03) return 1.0;
  return Math.round((0.97 / (1 - r)) * 100) / 100;
}

export function LimboTable() {
  const [currency, setCurrency] = useState<Currency>("gold");
  const [betIdx, setBetIdx] = useState(1);
  const [target, setTarget] = useState(2);
  const [phase, setPhase] = useState<"idle" | "launching" | "result">("idle");
  const [result, setResult] = useState<number | null>(null);
  const [won, setWon] = useState(false);
  const [winAmount, setWinAmount] = useState(0);

  const { goldCoins, sweepsCoins, deductBet, addWin } = useWalletStore();
  const betOptions = currency === "gold" ? BET_GC : BET_SC;
  const bet = betOptions[betIdx];
  const balance = currency === "gold" ? goldCoins : sweepsCoins;
  const winChance = Math.min(97, Math.round((0.97 / target) * 100));

  const launch = useCallback(async () => {
    if (phase !== "idle" || balance < bet) return;
    setPhase("launching");
    setResult(null);
    deductBet(currency, bet);

    const { sessionId, error } = await placeBet("limbo", currency, bet);
    if (error) { addWin(currency, bet); setPhase("idle"); return; }

    await new Promise<void>(r => setTimeout(r, 1200));
    const r = generateResult();
    const didWin = r >= target;
    const win = didWin ? (currency === "gold" ? Math.round(bet * target) : Math.round(bet * target * 100) / 100) : 0;

    setResult(r);
    setWon(didWin);
    setWinAmount(win);
    if (win > 0) addWin(currency, win);
    await recordWin(sessionId, win, { result: r, target, won: didWin });
    setPhase("result");
  }, [phase, balance, bet, currency, target, deductBet, addWin]);

  function reset() { setPhase("idle"); setResult(null); }

  return (
    <div className="space-y-6">
      {/* Currency */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-casino-800 rounded-2xl border border-casino-600 px-5 py-4">
        <div className="flex gap-2">
          {(["gold", "sweeps"] as Currency[]).map(c => (
            <button key={c} onClick={() => { if (phase === "idle") setCurrency(c); }}
              className={cn("px-4 py-1.5 rounded-full text-sm font-semibold transition-all",
                currency === c ? "bg-gold-400 text-casino-900" : "bg-casino-700 text-white/50 hover:text-white/80")}>
              {c === "gold" ? "🪙 Gold" : "💎 Sweeps"}
            </button>
          ))}
        </div>
        <span className="text-white/40 text-sm font-mono">
          {currency === "gold" ? `🪙 ${goldCoins.toLocaleString()}` : `💎 ${sweepsCoins.toFixed(2)}`}
        </span>
      </div>

      {/* Result display */}
      <div className={cn(
        "bg-casino-800 rounded-2xl border p-14 flex flex-col items-center gap-4 transition-all min-h-[200px] justify-center",
        phase === "result" && won ? "border-win/50 bg-win/5" :
        phase === "result" ? "border-red-500/30 bg-red-950/5" : "border-casino-600"
      )}>
        <p className="text-white/40 text-xs uppercase tracking-widest">
          {phase === "launching" ? "🚀 Launching…" : phase === "result" ? (won ? "✅ Hit target!" : "❌ Missed target") : `Target: ${target}×`}
        </p>
        <p className={cn("text-7xl font-black tabular-nums leading-none",
          phase === "result" && won ? "text-win" : phase === "result" ? "text-red-400" : phase === "launching" ? "text-white/20 animate-pulse" : "text-white/20"
        )}>
          {phase === "launching" ? "…" : result !== null ? `${result.toFixed(2)}×` : `${target}×`}
        </p>
        {phase === "result" && (
          <p className={cn("text-sm font-bold", won ? "text-win" : "text-white/40")}>
            {won
              ? `+${currency === "gold" ? winAmount.toLocaleString() : winAmount.toFixed(2)} ${currency === "gold" ? "GC" : "SC"}`
              : `Crashed at ${result?.toFixed(2)}× — needed ${target}×`}
          </p>
        )}
      </div>

      {/* Target + bet */}
      <div className="bg-casino-800 rounded-2xl border border-casino-600 p-5 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-xs font-medium uppercase tracking-wider">Target Multiplier</span>
            <span className="text-white/30 text-xs">{winChance}% win chance</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {TARGET_OPTIONS.map(t => (
              <button key={t} onClick={() => { if (phase === "idle") setTarget(t); }}
                className={cn("px-3 py-1.5 rounded-lg text-sm font-bold transition-all border",
                  target === t ? "bg-gold-400/10 border-gold-400/40 text-gold-400" : "bg-casino-700 border-transparent text-white/40 hover:text-white/70")}>
                {t}×
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-white/40 text-xs font-medium uppercase tracking-wider">Bet</span>
          {betOptions.map((opt, i) => (
            <button key={i} onClick={() => setBetIdx(i)} disabled={phase !== "idle"}
              className={cn("px-4 py-1.5 rounded-lg text-sm font-bold transition-all border",
                betIdx === i ? "bg-gold-400/10 border-gold-400/40 text-gold-400" : "bg-casino-700 border-transparent text-white/40 hover:text-white/70")}>
              {currency === "gold" ? opt.toLocaleString() : opt.toFixed(2)}
            </button>
          ))}
        </div>
        {phase === "result" ? (
          <Button variant="gold" size="lg" className="w-full" onClick={reset}>Launch Again</Button>
        ) : (
          <Button variant="gold" size="lg" className="w-full" disabled={balance < bet || phase === "launching"} onClick={launch}>
            {phase === "launching" ? "Launching…" : `Launch · Win ${target}×`}
          </Button>
        )}
      </div>
    </div>
  );
}

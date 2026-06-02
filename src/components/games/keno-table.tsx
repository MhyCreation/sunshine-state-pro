"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useWalletStore, type Currency } from "@/lib/store";
import { placeBet, recordWin } from "@/lib/actions/games";
import { Button } from "@/components/ui/button";

const GRID_SIZE = 80;
const DRAW_COUNT = 20;
const MAX_PICKS = 10;
const BET_GC = [100, 250, 500, 1000, 2500];
const BET_SC = [0.1, 0.25, 0.5, 1, 2.5];

// Keno paytable: [picks][matches] = multiplier
const PAYTABLE: Record<number, Record<number, number>> = {
  1:  { 1: 3 },
  2:  { 2: 10, 1: 1 },
  3:  { 3: 30, 2: 3 },
  4:  { 4: 100, 3: 6, 2: 1 },
  5:  { 5: 400, 4: 15, 3: 3, 2: 1 },
  6:  { 6: 1600, 5: 50, 4: 8, 3: 2 },
  7:  { 7: 5000, 6: 100, 5: 20, 4: 5, 3: 1 },
  8:  { 8: 10000, 7: 500, 6: 50, 5: 10, 4: 2 },
  9:  { 9: 25000, 8: 2500, 7: 200, 6: 25, 5: 6, 4: 1 },
  10: { 10: 100000, 9: 5000, 8: 500, 7: 50, 6: 10, 5: 2 },
};

function drawNumbers(): number[] {
  const pool = Array.from({ length: GRID_SIZE }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, DRAW_COUNT).sort((a, b) => a - b);
}

export function KenoTable() {
  const [currency, setCurrency] = useState<Currency>("gold");
  const [betIdx, setBetIdx] = useState(1);
  const [picks, setPicks] = useState<Set<number>>(new Set());
  const [drawn, setDrawn] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState<"pick" | "drawing" | "result">("pick");
  const [matches, setMatches] = useState(0);
  const [winAmount, setWinAmount] = useState(0);

  const { goldCoins, sweepsCoins, deductBet, addWin } = useWalletStore();
  const betOptions = currency === "gold" ? BET_GC : BET_SC;
  const bet = betOptions[betIdx];
  const balance = currency === "gold" ? goldCoins : sweepsCoins;
  const canPlay = picks.size > 0 && balance >= bet;

  function togglePick(n: number) {
    if (phase !== "pick") return;
    setPicks(prev => {
      const next = new Set(prev);
      if (next.has(n)) { next.delete(n); return next; }
      if (next.size >= MAX_PICKS) return prev;
      next.add(n);
      return next;
    });
  }

  const play = useCallback(async () => {
    if (!canPlay || phase !== "pick") return;
    setPhase("drawing");
    setDrawn(new Set());
    deductBet(currency, bet);

    const { sessionId, error } = await placeBet("keno", currency, bet);
    if (error) { addWin(currency, bet); setPhase("pick"); return; }

    const numbers = drawNumbers();
    // Animate numbers appearing one by one
    for (let i = 0; i < numbers.length; i++) {
      await new Promise<void>(r => setTimeout(r, 120));
      setDrawn(prev => new Set([...prev, numbers[i]]));
    }

    const hit = numbers.filter(n => picks.has(n)).length;
    const mult = PAYTABLE[picks.size]?.[hit] ?? 0;
    const win = mult * bet;
    setMatches(hit);
    setWinAmount(win);
    if (win > 0) addWin(currency, win);
    await recordWin(sessionId, win, { picks: [...picks], drawn: numbers, matches: hit });
    setPhase("result");
  }, [canPlay, phase, picks, currency, bet]);

  function reset() {
    setPicks(new Set());
    setDrawn(new Set());
    setMatches(0);
    setWinAmount(0);
    setPhase("pick");
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-casino-800 rounded-2xl border border-casino-600 px-5 py-4">
        <div className="flex gap-2">
          {(["gold", "sweeps"] as Currency[]).map(c => (
            <button key={c} onClick={() => { if (phase === "pick") setCurrency(c); }}
              className={cn("px-4 py-1.5 rounded-full text-sm font-semibold transition-all",
                currency === c ? "bg-gold-400 text-casino-900" : "bg-casino-700 text-white/50 hover:text-white/80"
              )}>
              {c === "gold" ? "🪙 Gold" : "💎 Sweeps"}
            </button>
          ))}
        </div>
        <span className="text-white/40 text-sm font-mono">
          {currency === "gold" ? `🪙 ${goldCoins.toLocaleString()}` : `💎 ${sweepsCoins.toFixed(2)}`}
        </span>
      </div>

      {/* Grid */}
      <div className="bg-casino-800 rounded-2xl border border-casino-600 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white/60 text-xs font-medium uppercase tracking-wider">
            Pick up to {MAX_PICKS} · Selected: {picks.size}
          </h3>
          {phase === "result" && (
            <span className={cn("text-sm font-bold", winAmount > 0 ? "text-win" : "text-white/40")}>
              {winAmount > 0 ? `🎉 +${currency === "gold" ? winAmount.toLocaleString() : winAmount.toFixed(2)} ${currency === "gold" ? "GC" : "SC"}` : "No win"}
            </span>
          )}
        </div>
        <div className="grid grid-cols-10 gap-1.5">
          {Array.from({ length: GRID_SIZE }, (_, i) => i + 1).map(n => {
            const isPick = picks.has(n);
            const isDrawn = drawn.has(n);
            const isMatch = isPick && isDrawn;
            return (
              <button key={n} onClick={() => togglePick(n)} disabled={phase !== "pick"}
                className={cn(
                  "aspect-square rounded-lg text-xs font-bold transition-all select-none",
                  isMatch ? "bg-win text-white scale-110 shadow-[0_0_8px_rgba(34,197,94,0.5)]" :
                  isDrawn ? "bg-gold-400/30 text-gold-300 ring-1 ring-gold-400/50" :
                  isPick  ? "bg-gold-400 text-casino-900" :
                  "bg-casino-700 text-white/50 hover:bg-casino-600 hover:text-white"
                )}>
                {n}
              </button>
            );
          })}
        </div>
      </div>

      {/* Paytable for current picks */}
      {picks.size > 0 && (
        <div className="bg-casino-800 rounded-xl border border-casino-600 p-4">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Paytable · {picks.size} picks</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PAYTABLE[picks.size] ?? {}).map(([match, mult]) => (
              <div key={match} className={cn(
                "flex gap-2 items-center px-3 py-1.5 rounded-lg text-xs",
                phase === "result" && matches === Number(match) ? "bg-win/20 border border-win/30" : "bg-casino-700"
              )}>
                <span className="text-white/50">{match} match{Number(match) > 1 ? "es" : ""}</span>
                <span className={cn("font-bold", phase === "result" && matches === Number(match) ? "text-win" : "text-gold-400")}>{mult}×</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bet + action */}
      <div className="bg-casino-800 rounded-2xl border border-casino-600 p-5 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-white/40 text-xs font-medium uppercase tracking-wider">Bet</span>
          {betOptions.map((opt, i) => (
            <button key={i} onClick={() => setBetIdx(i)} disabled={phase !== "pick"}
              className={cn("px-4 py-1.5 rounded-lg text-sm font-bold transition-all border",
                betIdx === i ? "bg-gold-400/10 border-gold-400/40 text-gold-400" : "bg-casino-700 border-transparent text-white/40 hover:text-white/70"
              )}>
              {currency === "gold" ? opt.toLocaleString() : opt.toFixed(2)}
            </button>
          ))}
        </div>
        {phase === "result" ? (
          <Button variant="gold" size="lg" className="w-full" onClick={reset}>Play Again</Button>
        ) : (
          <Button variant="gold" size="lg" className="w-full" disabled={!canPlay || phase === "drawing"} onClick={play}>
            {phase === "drawing" ? "Drawing…" : picks.size === 0 ? "Pick numbers to play" : `Play ${picks.size} number${picks.size > 1 ? "s" : ""}`}
          </Button>
        )}
      </div>
    </div>
  );
}

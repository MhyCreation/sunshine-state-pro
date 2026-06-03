"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useWalletStore, type Currency } from "@/lib/store";
import { placeBet, recordWin } from "@/lib/actions/games";
import { Button } from "@/components/ui/button";

const GRID = 25;
const MINE_OPTIONS = [3, 5, 10, 15];
const BET_GC = [100, 250, 500, 1000, 2500];
const BET_SC = [0.1, 0.25, 0.5, 1, 2.5];

function computeMultiplier(mineCount: number, revealed: number): number {
  if (revealed === 0) return 1;
  let prob = 1;
  for (let i = 0; i < revealed; i++) {
    prob *= (GRID - mineCount - i) / (GRID - i);
  }
  return Math.round((0.97 / prob) * 100) / 100;
}

function placeMinesAvoidingCell(count: number, avoid: number): Set<number> {
  const mines = new Set<number>();
  while (mines.size < count) {
    const r = Math.floor(Math.random() * GRID);
    if (r !== avoid) mines.add(r);
  }
  return mines;
}

export function MinesTable() {
  const [currency, setCurrency] = useState<Currency>("gold");
  const [betIdx, setBetIdx] = useState(1);
  const [mineCount, setMineCount] = useState(5);
  const [phase, setPhase] = useState<"idle" | "playing" | "cashed" | "exploded">("idle");
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [mines, setMines] = useState<Set<number>>(new Set());
  const [multiplier, setMultiplier] = useState(1.0);
  const [winAmount, setWinAmount] = useState(0);
  const [sessionId, setSessionId] = useState("");

  const { goldCoins, sweepsCoins, deductBet, addWin } = useWalletStore();
  const betOptions = currency === "gold" ? BET_GC : BET_SC;
  const bet = betOptions[betIdx];
  const balance = currency === "gold" ? goldCoins : sweepsCoins;
  const canCashout = phase === "playing" && revealed.size > 0;

  const startGame = useCallback(async () => {
    if (balance < bet || phase !== "idle") return;
    deductBet(currency, bet);
    const { sessionId: sid, error } = await placeBet("mines", currency, bet);
    if (error) { addWin(currency, bet); return; }
    setSessionId(sid);
    setRevealed(new Set());
    setMines(new Set());
    setMultiplier(1.0);
    setWinAmount(0);
    setPhase("playing");
  }, [balance, bet, currency, phase, deductBet, addWin]);

  function clickCell(idx: number) {
    if (phase !== "playing" || revealed.has(idx)) return;

    let m = mines;
    // Place mines lazily on first click (guaranteeing first click is safe)
    if (m.size === 0) {
      m = placeMinesAvoidingCell(mineCount, idx);
      setMines(m);
    }

    if (m.has(idx)) {
      const newRevealed = new Set([...revealed, idx]);
      setRevealed(newRevealed);
      setPhase("exploded");
      recordWin(sessionId, 0, { mines: [...m], hit: idx, safe: [...revealed] });
    } else {
      const newRevealed = new Set([...revealed, idx]);
      setRevealed(newRevealed);
      const mult = computeMultiplier(mineCount, newRevealed.size);
      setMultiplier(mult);
      // Auto-cashout if all safe cells revealed
      if (newRevealed.size === GRID - mineCount) {
        const win = currency === "gold" ? Math.round(bet * mult) : Math.round(bet * mult * 100) / 100;
        setWinAmount(win);
        addWin(currency, win);
        recordWin(sessionId, win, { multiplier: mult, safe: [...newRevealed] });
        setPhase("cashed");
      }
    }
  }

  function cashout() {
    if (!canCashout) return;
    const win = currency === "gold" ? Math.round(bet * multiplier) : Math.round(bet * multiplier * 100) / 100;
    setWinAmount(win);
    addWin(currency, win);
    recordWin(sessionId, win, { multiplier, safe: [...revealed] });
    setPhase("cashed");
  }

  function reset() {
    setPhase("idle");
    setRevealed(new Set());
    setMines(new Set());
    setMultiplier(1.0);
    setWinAmount(0);
  }

  const isPlaying = phase === "playing";
  const isCashed = phase === "cashed";
  const isExploded = phase === "exploded";
  const isDone = isCashed || isExploded;

  function getCellState(idx: number): "hidden" | "safe" | "mine" | "unrevealed-mine" {
    if (revealed.has(idx)) {
      return mines.has(idx) ? "mine" : "safe";
    }
    if (isDone && mines.has(idx)) return "unrevealed-mine";
    return "hidden";
  }

  return (
    <div className="space-y-6">
      {/* Currency */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-casino-800 rounded-2xl border border-casino-600 px-5 py-4">
        <div className="flex gap-2">
          {(["gold", "sweeps"] as Currency[]).map(c => (
            <button key={c} onClick={() => { if (phase === "idle") setCurrency(c); }}
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

      {/* Multiplier display */}
      <div className={cn(
        "bg-casino-800 rounded-2xl border px-5 py-4 flex items-center justify-between transition-all",
        isExploded ? "border-red-500/50" : isCashed ? "border-win/50" : "border-casino-600"
      )}>
        <div>
          <p className="text-white/40 text-xs uppercase tracking-wider">
            {isExploded ? "💥 Exploded!" : isCashed ? "🎉 Cashed Out!" : isPlaying ? "Current multiplier" : "Next multiplier"}
          </p>
          {isDone && winAmount > 0 && (
            <p className="text-win text-sm font-semibold mt-0.5">
              +{currency === "gold" ? winAmount.toLocaleString() : winAmount.toFixed(2)} {currency === "gold" ? "GC" : "SC"}
            </p>
          )}
        </div>
        <span className={cn(
          "text-3xl font-black tabular-nums",
          isExploded ? "text-red-400" : isCashed ? "text-win" : isPlaying ? "text-gold-400" : "text-white/30"
        )}>
          {multiplier.toFixed(2)}×
        </span>
      </div>

      {/* Grid */}
      <div className="bg-casino-800 rounded-2xl border border-casino-600 p-5">
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: GRID }, (_, i) => {
            const state = getCellState(i);
            return (
              <button
                key={i}
                onClick={() => clickCell(i)}
                disabled={!isPlaying || revealed.has(i)}
                className={cn(
                  "aspect-square rounded-xl text-xl transition-all select-none flex items-center justify-center",
                  state === "hidden"
                    ? isPlaying
                      ? "bg-casino-700 hover:bg-casino-600 hover:scale-105 active:scale-95"
                      : "bg-casino-700 opacity-50"
                    : state === "safe"
                    ? "bg-win/20 ring-1 ring-win/40 scale-105"
                    : state === "mine"
                    ? "bg-red-500/30 ring-1 ring-red-500/50"
                    : "bg-casino-700 opacity-40"
                )}>
                {state === "safe" ? "💎" : state === "mine" || state === "unrevealed-mine" ? "💣" : ""}
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-casino-800 rounded-2xl border border-casino-600 p-5 space-y-4">
        {phase === "idle" && (
          <>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-white/40 text-xs font-medium uppercase tracking-wider">Mines</span>
              {MINE_OPTIONS.map(m => (
                <button key={m} onClick={() => setMineCount(m)}
                  className={cn("px-4 py-1.5 rounded-lg text-sm font-bold transition-all border",
                    mineCount === m ? "bg-red-500/10 border-red-500/40 text-red-400" : "bg-casino-700 border-transparent text-white/40 hover:text-white/70"
                  )}>
                  {m} 💣
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-white/40 text-xs font-medium uppercase tracking-wider">Bet</span>
              {betOptions.map((opt, i) => (
                <button key={i} onClick={() => setBetIdx(i)}
                  className={cn("px-4 py-1.5 rounded-lg text-sm font-bold transition-all border",
                    betIdx === i ? "bg-gold-400/10 border-gold-400/40 text-gold-400" : "bg-casino-700 border-transparent text-white/40 hover:text-white/70"
                  )}>
                  {currency === "gold" ? opt.toLocaleString() : opt.toFixed(2)}
                </button>
              ))}
            </div>
            <Button variant="gold" size="lg" className="w-full" disabled={balance < bet} onClick={startGame}>
              Start — {mineCount} mines
            </Button>
          </>
        )}
        {isPlaying && (
          <Button variant="gold" size="lg" className="w-full" disabled={!canCashout} onClick={cashout}>
            {canCashout
              ? `Cash Out ${multiplier.toFixed(2)}× — ${currency === "gold" ? Math.round(bet * multiplier).toLocaleString() : (bet * multiplier).toFixed(2)} ${currency === "gold" ? "GC" : "SC"}`
              : "Click a gem to reveal it first"}
          </Button>
        )}
        {isDone && (
          <Button variant="gold" size="lg" className="w-full" onClick={reset}>Play Again</Button>
        )}
      </div>
    </div>
  );
}

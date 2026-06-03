"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useWalletStore, type Currency } from "@/lib/store";
import { placeBet, recordWin } from "@/lib/actions/games";
import { Button } from "@/components/ui/button";

const BET_GC = [100, 250, 500, 1000, 2500];
const BET_SC = [0.1, 0.25, 0.5, 1, 2.5];

function generateCrashPoint(): number {
  const r = Math.random();
  if (r < 0.03) return 1.0;
  return Math.round((0.97 / (1 - r)) * 100) / 100;
}

export function CrashTable() {
  const [currency, setCurrency] = useState<Currency>("gold");
  const [betIdx, setBetIdx] = useState(1);
  const [phase, setPhase] = useState<"idle" | "running" | "cashed" | "crashed">("idle");
  const [multiplier, setMultiplier] = useState(1.0);
  const [cashoutMultiplier, setCashoutMultiplier] = useState(0);
  const [crashPoint, setCrashPoint] = useState(0);

  const sessionIdRef = useRef("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const multiplierRef = useRef(1.0);
  const crashPointRef = useRef(0);
  const phaseRef = useRef<"idle" | "running" | "cashed" | "crashed">("idle");

  const { goldCoins, sweepsCoins, deductBet, addWin } = useWalletStore();
  const betOptions = currency === "gold" ? BET_GC : BET_SC;
  const bet = betOptions[betIdx];
  const balance = currency === "gold" ? goldCoins : sweepsCoins;

  function stopTimer() {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }

  useEffect(() => () => stopTimer(), []);

  const play = useCallback(async () => {
    if (phaseRef.current !== "idle" || balance < bet) return;
    deductBet(currency, bet);
    const { sessionId, error } = await placeBet("crash", currency, bet);
    if (error) { addWin(currency, bet); return; }
    sessionIdRef.current = sessionId;

    const cp = generateCrashPoint();
    crashPointRef.current = cp;
    multiplierRef.current = 1.0;
    setCrashPoint(cp);
    setMultiplier(1.0);
    setCashoutMultiplier(0);
    phaseRef.current = "running";
    setPhase("running");

    intervalRef.current = setInterval(() => {
      if (phaseRef.current !== "running") { stopTimer(); return; }
      const next = Math.round(multiplierRef.current * 1.00365 * 100) / 100;
      multiplierRef.current = next;
      setMultiplier(next);
      if (next >= crashPointRef.current) {
        stopTimer();
        phaseRef.current = "crashed";
        setPhase("crashed");
        recordWin(sessionIdRef.current, 0, { crashPoint: cp });
      }
    }, 50);
  }, [balance, bet, currency, deductBet, addWin]);

  const cashOut = useCallback(() => {
    if (phaseRef.current !== "running") return;
    stopTimer();
    const m = multiplierRef.current;
    const win = currency === "gold" ? Math.round(bet * m) : Math.round(bet * m * 100) / 100;
    setCashoutMultiplier(m);
    addWin(currency, win);
    recordWin(sessionIdRef.current, win, { cashoutMultiplier: m });
    phaseRef.current = "cashed";
    setPhase("cashed");
  }, [bet, currency, addWin]);

  function reset() {
    phaseRef.current = "idle";
    setPhase("idle");
    setMultiplier(1.0);
  }

  const isRunning = phase === "running";
  const isCrashed = phase === "crashed";
  const isCashed = phase === "cashed";

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

      {/* Crash display */}
      <div className={cn(
        "bg-casino-800 rounded-2xl border p-14 flex flex-col items-center justify-center gap-4 transition-all min-h-[220px]",
        isCrashed ? "border-red-500/50 bg-red-950/10" : isCashed ? "border-win/50 bg-win/5" : "border-casino-600"
      )}>
        <p className="text-white/40 text-xs uppercase tracking-widest">
          {isRunning ? "Flying… Cash out before it crashes!" : isCrashed ? "💥 Crashed!" : isCashed ? "🎉 Cashed Out!" : "Ready to launch"}
        </p>
        <p className={cn(
          "text-7xl font-black tabular-nums transition-colors leading-none",
          isCrashed ? "text-red-400" : isCashed ? "text-win" : isRunning ? "text-white" : "text-white/30"
        )}>
          {multiplier.toFixed(2)}×
        </p>
        {isCashed && (
          <p className="text-win font-bold text-lg">
            +{currency === "gold"
              ? Math.round(bet * cashoutMultiplier).toLocaleString()
              : (bet * cashoutMultiplier).toFixed(2)
            } {currency === "gold" ? "GC" : "SC"}
          </p>
        )}
        {isCrashed && (
          <p className="text-red-400/60 text-sm">Crashed at {crashPoint.toFixed(2)}×</p>
        )}
      </div>

      {/* Bet + action */}
      <div className="bg-casino-800 rounded-2xl border border-casino-600 p-5 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-white/40 text-xs font-medium uppercase tracking-wider">Bet</span>
          {betOptions.map((opt, i) => (
            <button key={i} onClick={() => setBetIdx(i)} disabled={phase !== "idle"}
              className={cn("px-4 py-1.5 rounded-lg text-sm font-bold transition-all border",
                betIdx === i ? "bg-gold-400/10 border-gold-400/40 text-gold-400" : "bg-casino-700 border-transparent text-white/40 hover:text-white/70"
              )}>
              {currency === "gold" ? opt.toLocaleString() : opt.toFixed(2)}
            </button>
          ))}
        </div>
        {phase === "idle" && (
          <Button variant="gold" size="lg" className="w-full" disabled={balance < bet} onClick={play}>
            Launch 🚀
          </Button>
        )}
        {isRunning && (
          <Button variant="gold" size="lg" className="w-full animate-pulse" onClick={cashOut}>
            Cash Out {multiplier.toFixed(2)}× —&nbsp;
            {currency === "gold"
              ? Math.round(bet * multiplier).toLocaleString()
              : (bet * multiplier).toFixed(2)
            } {currency === "gold" ? "GC" : "SC"}
          </Button>
        )}
        {(isCrashed || isCashed) && (
          <Button variant="gold" size="lg" className="w-full" onClick={reset}>Play Again</Button>
        )}
      </div>
    </div>
  );
}

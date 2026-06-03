"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useWalletStore, type Currency } from "@/lib/store";
import { placeBet, recordWin } from "@/lib/actions/games";
import { Button } from "@/components/ui/button";

const BET_GC = [100, 250, 500, 1000, 2500];
const BET_SC = [0.1, 0.25, 0.5, 1, 2.5];
const BASE_PAYOUT = 1.94; // ~97% RTP

export function CoinflipTable() {
  const [currency, setCurrency] = useState<Currency>("gold");
  const [betIdx, setBetIdx] = useState(1);
  const [pick, setPick] = useState<"heads" | "tails">("heads");
  const [phase, setPhase] = useState<"idle" | "flipping" | "playing" | "done">("idle");
  const [result, setResult] = useState<"heads" | "tails" | null>(null);
  const [streak, setStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1.0);
  const [sessionId, setSessionId] = useState("");
  const [history, setHistory] = useState<Array<"heads" | "tails">>([]);

  const { goldCoins, sweepsCoins, deductBet, addWin } = useWalletStore();
  const betOptions = currency === "gold" ? BET_GC : BET_SC;
  const bet = betOptions[betIdx];
  const balance = currency === "gold" ? goldCoins : sweepsCoins;

  const startFlip = useCallback(async () => {
    if (phase !== "idle" || balance < bet) return;
    setPhase("flipping");
    setResult(null);
    setStreak(0);
    setMultiplier(1.0);
    setHistory([]);
    deductBet(currency, bet);

    const { sessionId: sid, error } = await placeBet("coinflip", currency, bet);
    if (error) { addWin(currency, bet); setPhase("idle"); return; }
    setSessionId(sid);

    await flipOnce(sid, pick, 0, 1.0, []);
  }, [phase, balance, bet, currency, pick, deductBet, addWin]);

  async function flipOnce(sid: string, chosen: "heads" | "tails", currentStreak: number, currentMult: number, currentHistory: Array<"heads" | "tails">) {
    setPhase("flipping");
    await new Promise<void>(r => setTimeout(r, 700));
    const flip: "heads" | "tails" = Math.random() < 0.5 ? "heads" : "tails";
    setResult(flip);
    const newHistory = [...currentHistory, flip];
    setHistory(newHistory);

    if (flip !== chosen) {
      await recordWin(sid, 0, { history: newHistory, streak: currentStreak });
      setPhase("done");
    } else {
      const newStreak = currentStreak + 1;
      const newMult = Math.round(currentMult * BASE_PAYOUT * 100) / 100;
      setStreak(newStreak);
      setMultiplier(newMult);
      setPhase("playing");
    }
  }

  async function continueFlip() {
    if (phase !== "playing") return;
    await flipOnce(sessionId, pick, streak, multiplier, history);
  }

  async function collect() {
    if (phase !== "playing" || streak === 0) return;
    const win = currency === "gold" ? Math.round(bet * multiplier) : Math.round(bet * multiplier * 100) / 100;
    addWin(currency, win);
    await recordWin(sessionId, win, { history, streak, multiplier });
    setPhase("done");
  }

  function reset() { setPhase("idle"); setResult(null); setStreak(0); setMultiplier(1.0); setHistory([]); }

  const isFlipping = phase === "flipping";
  const isPlaying = phase === "playing";
  const isDone = phase === "done";
  const lastWon = isPlaying || (isDone && streak > 0);

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

      {/* Coin display */}
      <div className={cn(
        "bg-casino-800 rounded-2xl border p-10 flex flex-col items-center gap-5 transition-all min-h-[220px] justify-center",
        isPlaying ? "border-win/50" : isDone && streak > 0 ? "border-win/30" : isDone ? "border-red-500/30" : "border-casino-600"
      )}>
        <div className={cn(
          "w-28 h-28 rounded-full flex items-center justify-center text-5xl font-black shadow-2xl border-4 transition-all",
          isFlipping ? "animate-spin border-white/20 bg-casino-700" :
          result === "heads" ? "bg-gradient-to-br from-gold-400 to-amber-500 border-gold-300 shadow-gold-400/30" :
          result === "tails" ? "bg-gradient-to-br from-slate-400 to-slate-600 border-slate-300 shadow-slate-400/20" :
          "bg-casino-700 border-casino-500"
        )}>
          {isFlipping ? "🪙" : result === "heads" ? "👑" : result === "tails" ? "⭐" : "?"}
        </div>

        {result && !isFlipping && (
          <p className="text-white font-bold text-lg capitalize">{result}</p>
        )}

        <div className="flex items-center gap-6 text-center">
          {streak > 0 && (
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider">Streak</p>
              <p className="text-gold-400 font-black text-2xl">{streak}🔥</p>
            </div>
          )}
          {multiplier > 1 && (
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider">Multiplier</p>
              <p className={cn("font-black text-2xl", isPlaying ? "text-win" : isDone && streak > 0 ? "text-win" : "text-red-400")}>{multiplier.toFixed(2)}×</p>
            </div>
          )}
        </div>

        {/* History dots */}
        {history.length > 0 && (
          <div className="flex gap-1.5">
            {history.map((h, i) => (
              <div key={i} className={cn("w-5 h-5 rounded-full text-xs flex items-center justify-center",
                h === pick ? "bg-win/30 text-win" : "bg-red-500/30 text-red-400")}>
                {h === "heads" ? "H" : "T"}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-casino-800 rounded-2xl border border-casino-600 p-5 space-y-4">
        {phase === "idle" && (
          <>
            <div className="space-y-2">
              <span className="text-white/40 text-xs font-medium uppercase tracking-wider">Pick your side</span>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setPick("heads")}
                  className={cn("py-4 rounded-xl font-bold text-base transition-all border",
                    pick === "heads" ? "bg-gold-400/10 border-gold-400/40 text-gold-400" : "bg-casino-700 border-transparent text-white/50")}>
                  👑 Heads
                </button>
                <button onClick={() => setPick("tails")}
                  className={cn("py-4 rounded-xl font-bold text-base transition-all border",
                    pick === "tails" ? "bg-gold-400/10 border-gold-400/40 text-gold-400" : "bg-casino-700 border-transparent text-white/50")}>
                  ⭐ Tails
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-white/40 text-xs font-medium uppercase tracking-wider">Bet</span>
              {betOptions.map((opt, i) => (
                <button key={i} onClick={() => setBetIdx(i)}
                  className={cn("px-4 py-1.5 rounded-lg text-sm font-bold transition-all border",
                    betIdx === i ? "bg-gold-400/10 border-gold-400/40 text-gold-400" : "bg-casino-700 border-transparent text-white/40 hover:text-white/70")}>
                  {currency === "gold" ? opt.toLocaleString() : opt.toFixed(2)}
                </button>
              ))}
            </div>
            <Button variant="gold" size="lg" className="w-full" disabled={balance < bet} onClick={startFlip}>Flip!</Button>
          </>
        )}
        {isPlaying && (
          <div className="grid grid-cols-2 gap-3">
            <Button variant="gold" size="lg" onClick={continueFlip}>
              Flip Again {(multiplier * BASE_PAYOUT).toFixed(2)}×
            </Button>
            <Button variant="outline" size="lg" onClick={collect}>
              Collect {currency === "gold" ? Math.round(bet * multiplier).toLocaleString() : (bet * multiplier).toFixed(2)} {currency === "gold" ? "GC" : "SC"}
            </Button>
          </div>
        )}
        {isDone && (
          <Button variant="gold" size="lg" className="w-full" onClick={reset}>Play Again</Button>
        )}
      </div>
    </div>
  );
}

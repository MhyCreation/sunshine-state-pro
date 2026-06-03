"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useWalletStore, type Currency } from "@/lib/store";
import { placeBet, recordWin } from "@/lib/actions/games";
import { Button } from "@/components/ui/button";

const ROWS = 8;
const BUCKETS = 9;
// Symmetric multipliers: edges high, center low (97.7% RTP via binomial distribution)
const MULT = [22, 5, 1, 0.5, 0.2, 0.5, 1, 5, 22];
const BUCKET_COLORS = ["#f5c842","#a78bfa","#60a5fa","#34d399","#6b7280","#34d399","#60a5fa","#a78bfa","#f5c842"];
const BET_GC = [100, 250, 500, 1000, 2500];
const BET_SC = [0.1, 0.25, 0.5, 1, 2.5];

function simulateDrop(): { path: number[]; bucket: number } {
  const choices: number[] = [];
  for (let i = 0; i < ROWS; i++) choices.push(Math.random() < 0.5 ? 0 : 1);
  const path: number[] = [0];
  for (const c of choices) path.push(path[path.length - 1] + c);
  return { path, bucket: path[ROWS] };
}

export function PlinkoTable() {
  const [currency, setCurrency] = useState<Currency>("gold");
  const [betIdx, setBetIdx] = useState(1);
  const [phase, setPhase] = useState<"idle" | "dropping" | "result">("idle");
  const [activePath, setActivePath] = useState<number[]>([]);
  const [bucket, setBucket] = useState<number | null>(null);
  const [winAmount, setWinAmount] = useState(0);

  const { goldCoins, sweepsCoins, deductBet, addWin } = useWalletStore();
  const betOptions = currency === "gold" ? BET_GC : BET_SC;
  const bet = betOptions[betIdx];
  const balance = currency === "gold" ? goldCoins : sweepsCoins;

  const drop = useCallback(async () => {
    if (phase !== "idle" || balance < bet) return;
    setPhase("dropping");
    setActivePath([]);
    setBucket(null);
    deductBet(currency, bet);

    const { sessionId, error } = await placeBet("plinko", currency, bet);
    if (error) { addWin(currency, bet); setPhase("idle"); return; }

    const { path, bucket: b } = simulateDrop();

    for (let i = 1; i <= path.length; i++) {
      await new Promise<void>(r => setTimeout(r, 160));
      setActivePath(path.slice(0, i));
    }

    const mult = MULT[b];
    const win = currency === "gold" ? Math.round(bet * mult) : Math.round(bet * mult * 100) / 100;
    setBucket(b);
    setWinAmount(win);
    if (win > 0) addWin(currency, win);
    await recordWin(sessionId, win, { bucket: b, multiplier: mult, path });
    setPhase("result");
  }, [phase, balance, bet, currency, deductBet, addWin]);

  function reset() { setPhase("idle"); setActivePath([]); setBucket(null); setWinAmount(0); }

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

      {/* Plinko board */}
      <div className="bg-casino-800 rounded-2xl border border-casino-600 p-5">
        {/* Peg rows */}
        <div className="flex flex-col gap-2 mb-4">
          {Array.from({ length: ROWS }, (_, row) => {
            const pegsInRow = row + 2;
            const ballCol = activePath[row + 1]; // ball position after this row
            return (
              <div key={row} className="flex justify-center gap-2">
                {Array.from({ length: pegsInRow }, (_, peg) => {
                  const isBall = activePath.length === row + 2 && peg === ballCol;
                  const isPath = activePath.length > row + 2 && peg === activePath[row + 1];
                  return (
                    <div key={peg} className={cn(
                      "w-4 h-4 rounded-full transition-all duration-150",
                      isBall ? "bg-gold-400 shadow-[0_0_8px_rgba(245,200,66,0.8)] scale-125" :
                      isPath ? "bg-gold-400/40" :
                      "bg-casino-600"
                    )} />
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Buckets */}
        <div className="grid grid-cols-9 gap-1">
          {MULT.map((m, i) => (
            <div key={i} className={cn(
              "rounded-lg py-2 text-center text-xs font-bold transition-all",
              bucket === i ? "scale-110 shadow-lg ring-2 ring-white/40" : "",
              bucket !== null && bucket !== i ? "opacity-40" : ""
            )} style={{ backgroundColor: bucket === i ? BUCKET_COLORS[i] + "33" : "rgba(255,255,255,0.06)", color: BUCKET_COLORS[i], borderColor: bucket === i ? BUCKET_COLORS[i] : "transparent", borderWidth: 1 }}>
              {m}×
            </div>
          ))}
        </div>

        {phase === "result" && bucket !== null && (
          <p className={cn("text-center text-sm font-bold mt-3", winAmount > 0 ? "text-win" : "text-white/40")}>
            {winAmount > 0 ? `🎉 +${currency === "gold" ? winAmount.toLocaleString() : winAmount.toFixed(2)} ${currency === "gold" ? "GC" : "SC"}` : "No win — try again!"}
          </p>
        )}
      </div>

      {/* Bet + action */}
      <div className="bg-casino-800 rounded-2xl border border-casino-600 p-5 space-y-4">
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
          <Button variant="gold" size="lg" className="w-full" onClick={reset}>Drop Again</Button>
        ) : (
          <Button variant="gold" size="lg" className="w-full" disabled={balance < bet || phase === "dropping"} onClick={drop}>
            {phase === "dropping" ? "Dropping…" : "Drop Ball 🎱"}
          </Button>
        )}
      </div>
    </div>
  );
}

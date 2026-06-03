"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useWalletStore, type Currency } from "@/lib/store";
import { placeBet, recordWin } from "@/lib/actions/games";
import { Button } from "@/components/ui/button";

const BET_GC = [100, 250, 500, 1000, 2500];
const BET_SC = [0.1, 0.25, 0.5, 1, 2.5];

type DiceBet = { label: string; description: string; winChance: number; payout: number };
const DICE_BETS: DiceBet[] = [
  { label: "Under 34",  description: "Roll 1–33",   winChance: 0.33, payout: 2.94 },
  { label: "Under 50",  description: "Roll 1–49",   winChance: 0.49, payout: 1.98 },
  { label: "Over 50",   description: "Roll 51–100", winChance: 0.50, payout: 1.94 },
  { label: "Over 67",   description: "Roll 68–100", winChance: 0.33, payout: 2.94 },
];

export function DiceTable() {
  const [currency, setCurrency] = useState<Currency>("gold");
  const [betIdx, setBetIdx] = useState(1);
  const [diceType, setDiceType] = useState(2); // index into DICE_BETS
  const [phase, setPhase] = useState<"idle" | "rolling" | "result">("idle");
  const [roll, setRoll] = useState<number | null>(null);
  const [won, setWon] = useState(false);
  const [winAmount, setWinAmount] = useState(0);

  const { goldCoins, sweepsCoins, deductBet, addWin } = useWalletStore();
  const betOptions = currency === "gold" ? BET_GC : BET_SC;
  const bet = betOptions[betIdx];
  const balance = currency === "gold" ? goldCoins : sweepsCoins;
  const selected = DICE_BETS[diceType];

  const rollDice = useCallback(async () => {
    if (phase !== "idle" || balance < bet) return;
    setPhase("rolling");
    setRoll(null);
    deductBet(currency, bet);

    const { sessionId, error } = await placeBet("dice", currency, bet);
    if (error) { addWin(currency, bet); setPhase("idle"); return; }

    // Animate roll
    for (let i = 0; i < 12; i++) {
      await new Promise<void>(r => setTimeout(r, 60));
      setRoll(Math.floor(Math.random() * 100) + 1);
    }
    // Final roll
    const result = Math.floor(Math.random() * 100) + 1;
    setRoll(result);

    const db = DICE_BETS[diceType];
    let didWin = false;
    if (db.label.startsWith("Under")) didWin = result < parseInt(db.label.split(" ")[1]);
    else didWin = result > parseInt(db.label.split(" ")[1]);

    const win = didWin ? (currency === "gold" ? Math.round(bet * db.payout) : Math.round(bet * db.payout * 100) / 100) : 0;
    setWon(didWin);
    setWinAmount(win);
    if (win > 0) addWin(currency, win);
    await recordWin(sessionId, win, { roll: result, bet: db.label, won: didWin });
    setPhase("result");
  }, [phase, balance, bet, currency, diceType, deductBet, addWin]);

  function reset() { setPhase("idle"); setRoll(null); }

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

      {/* Roll display */}
      <div className={cn(
        "bg-casino-800 rounded-2xl border p-12 flex flex-col items-center gap-3 transition-all",
        phase === "result" && won ? "border-win/50" : phase === "result" ? "border-red-500/30" : "border-casino-600"
      )}>
        <p className="text-white/40 text-xs uppercase tracking-widest">
          {phase === "rolling" ? "Rolling…" : phase === "result" ? (won ? "🎉 Winner!" : "No luck this time") : "Place your bet"}
        </p>
        <p className={cn("text-8xl font-black tabular-nums leading-none",
          phase === "result" && won ? "text-win" : phase === "result" ? "text-red-400" : roll !== null ? "text-white/60" : "text-white/20"
        )}>
          {roll ?? "?"}
        </p>
        {phase === "result" && (
          <p className={cn("text-sm font-bold", won ? "text-win" : "text-white/30")}>
            {won
              ? `+${currency === "gold" ? winAmount.toLocaleString() : winAmount.toFixed(2)} ${currency === "gold" ? "GC" : "SC"}`
              : `Needed ${selected.description.toLowerCase()}`}
          </p>
        )}
      </div>

      {/* Bet type */}
      <div className="bg-casino-800 rounded-2xl border border-casino-600 p-5 space-y-4">
        <div className="space-y-2">
          <span className="text-white/40 text-xs font-medium uppercase tracking-wider">Bet Type</span>
          <div className="grid grid-cols-2 gap-2">
            {DICE_BETS.map((db, i) => (
              <button key={i} onClick={() => { if (phase === "idle") setDiceType(i); }}
                className={cn("px-4 py-3 rounded-xl text-sm font-semibold transition-all border text-left",
                  diceType === i ? "bg-gold-400/10 border-gold-400/40 text-gold-400" : "bg-casino-700 border-transparent text-white/50 hover:text-white/80")}>
                <div>{db.label}</div>
                <div className={cn("text-xs mt-0.5", diceType === i ? "text-gold-400/60" : "text-white/30")}>{db.description} · {db.payout}×</div>
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
          <Button variant="gold" size="lg" className="w-full" onClick={reset}>Roll Again</Button>
        ) : (
          <Button variant="gold" size="lg" className="w-full" disabled={balance < bet || phase === "rolling"} onClick={rollDice}>
            {phase === "rolling" ? "Rolling…" : `Roll — ${selected.payout}× payout`}
          </Button>
        )}
      </div>
    </div>
  );
}

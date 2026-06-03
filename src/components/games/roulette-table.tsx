"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useWalletStore, type Currency } from "@/lib/store";
import { placeBet, recordWin } from "@/lib/actions/games";
import { Button } from "@/components/ui/button";

// European roulette: 0–36
const RED_NUMBERS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const GREEN_NUMBERS = new Set([0]);

function getColor(n: number): "red" | "black" | "green" {
  if (GREEN_NUMBERS.has(n)) return "green";
  if (RED_NUMBERS.has(n)) return "red";
  return "black";
}

type BetType =
  | { kind: "straight"; number: number }
  | { kind: "color"; color: "red" | "black" }
  | { kind: "parity"; parity: "odd" | "even" }
  | { kind: "half"; half: "low" | "high" }
  | { kind: "dozen"; dozen: 1 | 2 | 3 }
  | { kind: "column"; column: 1 | 2 | 3 };

interface PlacedBet {
  id: string;
  bet: BetType;
  amount: number;
  label: string;
}

function betPays(bet: BetType, result: number): number {
  const c = getColor(result);
  switch (bet.kind) {
    case "straight": return bet.number === result ? 35 : 0;
    case "color": return c === bet.color && result !== 0 ? 1 : 0;
    case "parity":
      if (result === 0) return 0;
      return (bet.parity === "odd" ? result % 2 !== 0 : result % 2 === 0) ? 1 : 0;
    case "half":
      if (result === 0) return 0;
      return (bet.half === "low" ? result <= 18 : result >= 19) ? 1 : 0;
    case "dozen":
      if (result === 0) return 0;
      return Math.ceil(result / 12) === bet.dozen ? 2 : 0;
    case "column":
      if (result === 0) return 0;
      return result % 3 === (bet.column === 3 ? 0 : bet.column) ? 2 : 0;
    default: return 0;
  }
}

function betLabel(bet: BetType): string {
  switch (bet.kind) {
    case "straight": return `#${bet.number}`;
    case "color": return bet.color === "red" ? "Red" : "Black";
    case "parity": return bet.parity === "odd" ? "Odd" : "Even";
    case "half": return bet.half === "low" ? "1–18" : "19–36";
    case "dozen": return `${bet.dozen === 1 ? "1st" : bet.dozen === 2 ? "2nd" : "3rd"} 12`;
    case "column": return `Col ${bet.column}`;
    default: return "Bet";
  }
}

const CHIP_AMOUNTS_GC = [100, 500, 1000, 5000];
const CHIP_AMOUNTS_SC = [0.1, 0.5, 1, 5];

type Phase = "betting" | "spinning" | "result";

const GRID_NUMBERS = [
  [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
  [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
  [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
];

export function RouletteTable() {
  const [currency, setCurrency] = useState<Currency>("gold");
  const [chipIdx, setChipIdx] = useState(1);
  const [bets, setBets] = useState<PlacedBet[]>([]);
  const [phase, setPhase] = useState<Phase>("betting");
  const [result, setResult] = useState<number | null>(null);
  const [winAmount, setWinAmount] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const [spinning, setSpinning] = useState(false);

  const { goldCoins, sweepsCoins, deductBet, addWin } = useWalletStore();
  const chipAmounts = currency === "gold" ? CHIP_AMOUNTS_GC : CHIP_AMOUNTS_SC;
  const chipAmount = chipAmounts[chipIdx];
  const totalBet = bets.reduce((s, b) => s + b.amount, 0);
  const balance = currency === "gold" ? goldCoins : sweepsCoins;

  const addBet = useCallback((bet: BetType) => {
    if (phase !== "betting") return;
    if (balance - totalBet < chipAmount) return;
    const id = `${bet.kind}-${JSON.stringify(bet)}-${Date.now()}`;
    setBets((prev) => [...prev, { id, bet, amount: chipAmount, label: betLabel(bet) }]);
  }, [phase, balance, totalBet, chipAmount]);

  const clearBets = () => setBets([]);

  const spin = useCallback(async () => {
    if (bets.length === 0 || totalBet > balance) return;
    setSpinning(true);
    setPhase("spinning");

    deductBet(currency, totalBet);

    const { sessionId, error } = await placeBet("roulette", currency, totalBet);
    if (error) {
      addWin(currency, totalBet);
      setPhase("betting");
      setSpinning(false);
      return;
    }

    // Simulate wheel spin delay
    await new Promise((r) => setTimeout(r, 2000));

    const winNumber = Math.floor(Math.random() * 37); // 0–36
    setResult(winNumber);

    let totalWin = 0;
    for (const b of bets) {
      const multiplier = betPays(b.bet, winNumber);
      if (multiplier > 0) {
        totalWin += b.amount + b.amount * multiplier; // return stake + winnings
      }
    }

    setWinAmount(totalWin);
    setHistory((prev) => [winNumber, ...prev].slice(0, 20));
    setPhase("result");
    setSpinning(false);

    if (totalWin > 0) {
      addWin(currency, totalWin);
    }

    await recordWin(sessionId, totalWin, { result: winNumber });
  }, [bets, totalBet, balance, currency, deductBet, addWin]);

  const reset = () => {
    setPhase("betting");
    setBets([]);
    setResult(null);
    setWinAmount(0);
  };

  const colorClass = (n: number) => {
    const c = getColor(n);
    return c === "red"
      ? "bg-red-600 hover:bg-red-500 text-white"
      : c === "black"
        ? "bg-gray-900 hover:bg-gray-800 text-white border border-gray-600"
        : "bg-green-700 text-white";
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-3xl mx-auto">
      {/* Controls */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4 bg-casino-800 rounded-xl p-4 border border-casino-600">
        <div className="flex gap-2">
          {(["gold", "sweeps"] as Currency[]).map((c) => (
            <button
              key={c}
              disabled={phase !== "betting"}
              onClick={() => { setCurrency(c); setBets([]); setChipIdx(1); }}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all disabled:opacity-50",
                currency === c ? "bg-gradient-gold text-casino-900" : "bg-casino-700 text-white/60 hover:text-white"
              )}
            >
              {c === "gold" ? "🪙 Gold" : "💎 Sweeps"}
            </button>
          ))}
        </div>
        <div className="text-sm text-white/50">
          {currency === "gold" ? `🪙 ${goldCoins.toLocaleString()} GC` : `💎 ${sweepsCoins.toFixed(2)} SC`}
        </div>
      </div>

      {/* Wheel display */}
      <div className="flex items-center gap-8 w-full justify-center">
        <div className={cn(
          "w-32 h-32 rounded-full border-4 border-gold-400 flex items-center justify-center shadow-gold-glow transition-all",
          spinning ? "animate-spin" : "",
          result !== null
            ? getColor(result) === "red"
              ? "bg-red-700"
              : getColor(result) === "green"
                ? "bg-green-800"
                : "bg-gray-900"
            : "bg-casino-600"
        )}>
          <span className="text-4xl font-display font-bold text-white">
            {spinning ? "🎲" : result !== null ? result : "?"}
          </span>
        </div>

        {/* History */}
        <div className="flex flex-col gap-1">
          <div className="text-white/40 text-xs mb-1">Recent</div>
          <div className="flex flex-wrap gap-1 max-w-[160px]">
            {history.slice(0, 10).map((n, i) => (
              <div
                key={i}
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold",
                  getColor(n) === "red" ? "bg-red-600 text-white" :
                  getColor(n) === "green" ? "bg-green-700 text-white" :
                  "bg-gray-800 text-white border border-gray-600"
                )}
              >
                {n}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Result message */}
      {phase === "result" && (
        <div className={cn(
          "text-center py-3 px-6 rounded-xl",
          winAmount > 0 ? "bg-win/20 border border-win/40" : "bg-casino-700 border border-casino-500"
        )}>
          <div className="font-display text-2xl font-bold">
            {winAmount > 0 ? (
              <span className="text-win">
                🎉 Won {currency === "gold" ? winAmount.toLocaleString() : winAmount.toFixed(2)} {currency === "gold" ? "GC" : "SC"}!
              </span>
            ) : (
              <span className="text-white/50">No win — ball landed on {result} ({getColor(result!)})</span>
            )}
          </div>
        </div>
      )}

      {/* Betting table */}
      <div className="w-full felt rounded-2xl border border-felt-600 p-4">
        {/* Zero */}
        <div className="flex mb-1">
          <button
            onClick={() => addBet({ kind: "straight", number: 0 })}
            disabled={phase !== "betting"}
            className={cn(
              "w-full py-2 rounded text-sm font-bold transition-all",
              colorClass(0),
              phase !== "betting" && "opacity-60 cursor-default",
              result === 0 && "ring-2 ring-gold-400"
            )}
          >
            0
          </button>
        </div>

        {/* Number grid */}
        <div className="grid gap-0.5 mb-1">
          {GRID_NUMBERS.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-0.5">
              {row.map((n) => (
                <button
                  key={n}
                  onClick={() => addBet({ kind: "straight", number: n })}
                  disabled={phase !== "betting"}
                  className={cn(
                    "flex-1 py-2 rounded text-xs font-bold transition-all",
                    colorClass(n),
                    phase !== "betting" && "opacity-60 cursor-default",
                    result === n && "ring-2 ring-gold-400"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Outside bets */}
        <div className="grid grid-cols-3 gap-1 mt-2">
          {[
            { label: "1st 12", bet: { kind: "dozen" as const, dozen: 1 as const } },
            { label: "2nd 12", bet: { kind: "dozen" as const, dozen: 2 as const } },
            { label: "3rd 12", bet: { kind: "dozen" as const, dozen: 3 as const } },
          ].map(({ label, bet }) => (
            <button
              key={label}
              onClick={() => addBet(bet)}
              disabled={phase !== "betting"}
              className="py-2 rounded bg-felt-700 border border-white/20 text-white text-xs font-medium hover:bg-felt-600 transition-all disabled:opacity-60"
            >
              {label}
            </button>
          ))}
          {[
            { label: "1–18", bet: { kind: "half" as const, half: "low" as const } },
            { label: "Even", bet: { kind: "parity" as const, parity: "even" as const } },
            { label: "Red", bet: { kind: "color" as const, color: "red" as const } },
            { label: "Black", bet: { kind: "color" as const, color: "black" as const } },
            { label: "Odd", bet: { kind: "parity" as const, parity: "odd" as const } },
            { label: "19–36", bet: { kind: "half" as const, half: "high" as const } },
          ].map(({ label, bet }) => (
            <button
              key={label}
              onClick={() => addBet(bet)}
              disabled={phase !== "betting"}
              className={cn(
                "py-2 rounded text-xs font-bold transition-all disabled:opacity-60",
                label === "Red" ? "bg-red-700 text-white hover:bg-red-600" :
                label === "Black" ? "bg-gray-900 text-white border border-gray-600 hover:bg-gray-800" :
                "bg-felt-700 border border-white/20 text-white hover:bg-felt-600"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chip selector & placed bets */}
      <div className="w-full bg-casino-800 rounded-xl border border-casino-600 p-4 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-white/50 text-xs">Chip:</span>
          {chipAmounts.map((amt, idx) => (
            <button
              key={idx}
              onClick={() => setChipIdx(idx)}
              className={cn(
                "w-12 h-12 rounded-full border-2 text-xs font-bold transition-all",
                chipIdx === idx
                  ? "border-gold-400 bg-gold-400 text-casino-900 shadow-gold-glow"
                  : "border-casino-400 bg-casino-700 text-white hover:border-gold-400/50"
              )}
            >
              {currency === "gold" ? (amt >= 1000 ? `${amt / 1000}K` : amt) : amt}
            </button>
          ))}
          <div className="ml-auto text-sm text-white/50">
            Total bet: <span className="text-gold-400 font-semibold">
              {currency === "gold" ? totalBet.toLocaleString() : totalBet.toFixed(2)}{" "}
              {currency === "gold" ? "GC" : "SC"}
            </span>
          </div>
        </div>

        {bets.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {bets.map((b) => (
              <span key={b.id} className="px-2 py-0.5 rounded bg-casino-600 text-xs text-white/70">
                {b.label} ({currency === "gold" ? b.amount.toLocaleString() : b.amount.toFixed(2)})
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          {phase === "betting" && (
            <>
              <Button variant="outline" size="lg" onClick={clearBets} disabled={bets.length === 0} className="flex-1">
                Clear
              </Button>
              <Button
                variant="gold"
                size="lg"
                onClick={spin}
                disabled={bets.length === 0 || totalBet > balance}
                className="flex-1"
              >
                {spinning ? "Spinning..." : "Spin!"}
              </Button>
            </>
          )}
          {phase === "spinning" && (
            <div className="w-full text-center text-white/50 text-sm py-2 animate-pulse">Ball in motion…</div>
          )}
          {phase === "result" && (
            <Button variant="gold" size="lg" onClick={reset} className="w-full">
              New Spin
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

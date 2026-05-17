"use client";

import { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { useWalletStore, type Currency } from "@/lib/store";
import { placeBet, recordWin } from "@/lib/actions/games";
import { Button } from "@/components/ui/button";

// Symbol definitions
const SYMBOLS = [
  { id: "cherry", emoji: "🍒", label: "Cherry", weight: 35, pays: [0, 0, 3, 15, 40] },
  { id: "lemon", emoji: "🍋", label: "Lemon", weight: 30, pays: [0, 0, 5, 25, 60] },
  { id: "orange", emoji: "🍊", label: "Orange", weight: 25, pays: [0, 0, 8, 40, 100] },
  { id: "grape", emoji: "🍇", label: "Grape", weight: 20, pays: [0, 0, 12, 60, 150] },
  { id: "bell", emoji: "🔔", label: "Bell", weight: 15, pays: [0, 0, 18, 90, 225] },
  { id: "star", emoji: "⭐", label: "Star", weight: 10, pays: [0, 0, 25, 125, 300] },
  { id: "diamond", emoji: "💎", label: "Diamond", weight: 5, pays: [0, 0, 50, 250, 600] },
  { id: "seven", emoji: "7️⃣", label: "Seven", weight: 3, pays: [0, 0, 100, 500, 1500] },
  { id: "wild", emoji: "🃏", label: "Wild", weight: 2, pays: [0, 0, 200, 1000, 5000] },
] as const;

// 9 paylines — each is [row indices for cols 0..4] (0=top, 1=mid, 2=bottom)
const PAYLINES = [
  [1, 1, 1, 1, 1], // mid
  [0, 0, 0, 0, 0], // top
  [2, 2, 2, 2, 2], // bottom
  [0, 1, 2, 1, 0], // V
  [2, 1, 0, 1, 2], // ^
  [0, 0, 1, 0, 0],
  [2, 2, 1, 2, 2],
  [1, 0, 0, 0, 1],
  [1, 2, 2, 2, 1],
];

type SymbolId = (typeof SYMBOLS)[number]["id"];
type Grid = SymbolId[][];

function weightedRandom(): SymbolId {
  const total = SYMBOLS.reduce((s, sym) => s + sym.weight, 0);
  let r = Math.random() * total;
  for (const sym of SYMBOLS) {
    r -= sym.weight;
    if (r <= 0) return sym.id;
  }
  return SYMBOLS[0].id;
}

function generateGrid(): Grid {
  return Array.from({ length: 5 }, () =>
    Array.from({ length: 3 }, () => weightedRandom())
  );
}

function getSymbol(id: SymbolId) {
  return SYMBOLS.find((s) => s.id === id)!;
}

function isWild(id: SymbolId) {
  return id === "wild";
}

function calculateWins(grid: Grid, betPerLine: number) {
  let totalWin = 0;
  const winningLines: number[] = [];

  for (let li = 0; li < PAYLINES.length; li++) {
    const line = PAYLINES[li];
    const lineSymbols = line.map((row, col) => grid[col][row]);
    const first = lineSymbols[0];

    // Count consecutive matches from left
    let count = 0;
    for (let i = 0; i < lineSymbols.length; i++) {
      if (lineSymbols[i] === first || isWild(lineSymbols[i])) {
        count++;
      } else if (isWild(first) && lineSymbols[i] !== first) {
        // Wild as first: match any symbol up to this point
        break;
      } else {
        break;
      }
    }

    if (count >= 3) {
      const baseSymbol = isWild(first) ? lineSymbols.find((s) => !isWild(s)) ?? first : first;
      const sym = getSymbol(baseSymbol);
      const multiplier = sym.pays[count - 1] ?? 0;
      if (multiplier > 0) {
        totalWin += betPerLine * multiplier;
        winningLines.push(li);
      }
    }
  }

  return { totalWin, winningLines };
}

const BET_OPTIONS_GC = [100, 250, 500, 1000, 2500, 5000];
const BET_OPTIONS_SC = [0.1, 0.25, 0.5, 1, 2.5, 5];

interface Props {
  initialCurrency?: Currency;
}

export function SlotMachine({ initialCurrency = "gold" }: Props) {
  const [grid, setGrid] = useState<Grid>(generateGrid);
  const [spinning, setSpinning] = useState(false);
  const [lockedReels, setLockedReels] = useState([true, true, true, true, true]);
  const [currency, setCurrency] = useState<Currency>(initialCurrency);
  const [betIndex, setBetIndex] = useState(2);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [winningLines, setWinningLines] = useState<number[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [randomGrid, setRandomGrid] = useState<Grid>(generateGrid);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { goldCoins, sweepsCoins, deductBet, addWin } = useWalletStore();

  const betOptions = currency === "gold" ? BET_OPTIONS_GC : BET_OPTIONS_SC;
  const betPerLine = betOptions[betIndex];
  const totalBet = betPerLine * PAYLINES.length;

  const balance = currency === "gold" ? goldCoins : sweepsCoins;
  const balanceLabel = currency === "gold" ? `🪙 ${goldCoins.toLocaleString()} GC` : `💎 ${sweepsCoins.toFixed(2)} SC`;

  const spin = useCallback(async () => {
    if (spinning) return;
    if (balance < totalBet) {
      setMessage("Insufficient balance");
      return;
    }

    setSpinning(true);
    setLastWin(null);
    setWinningLines([]);
    setMessage(null);
    setLockedReels([false, false, false, false, false]);

    // Optimistically deduct bet in UI
    deductBet(currency, totalBet);

    // Place bet on server
    const { sessionId, error } = await placeBet("slots", currency, totalBet);
    if (error) {
      setMessage(error);
      setSpinning(false);
      addWin(currency, totalBet); // refund
      return;
    }

    // Determine final grid
    const finalGrid = generateGrid();

    // Start rapid-cycling animation
    intervalRef.current = setInterval(() => {
      setRandomGrid(generateGrid());
    }, 80);

    // Lock reels one by one
    const lockReel = (reelIdx: number) => {
      setLockedReels((prev) => {
        const next = [...prev];
        next[reelIdx] = true;
        return next;
      });
    };

    const delays = [900, 1300, 1700, 2100, 2500];
    delays.forEach((delay, idx) => {
      setTimeout(() => {
        lockReel(idx);
        setGrid((prev) => {
          const next = prev.map((col, ci) => (ci === idx ? finalGrid[idx] : col));
          return next;
        });
      }, delay);
    });

    setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setGrid(finalGrid);
      setLockedReels([true, true, true, true, true]);
      setSpinning(false);

      const { totalWin, winningLines: wl } = calculateWins(finalGrid, betPerLine);
      setWinningLines(wl);

      if (totalWin > 0) {
        setLastWin(totalWin);
        addWin(currency, totalWin);
        recordWin(sessionId, totalWin, { grid: finalGrid, winningLines: wl });
        setMessage(
          currency === "gold"
            ? `🎉 You won ${totalWin.toLocaleString()} GC!`
            : `🎉 You won ${totalWin.toFixed(2)} SC!`
        );
      } else {
        setMessage("No win — try again!");
        recordWin(sessionId, 0, { grid: finalGrid });
      }
    }, 2800);
  }, [spinning, balance, totalBet, currency, betPerLine, deductBet, addWin]);

  // Display grid: show random symbols for unlocked reels
  const displayGrid = lockedReels.map((locked, col) =>
    locked ? grid[col] : randomGrid[col]
  );

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Currency & Bet Controls */}
      <div className="w-full max-w-2xl flex flex-wrap items-center justify-between gap-4 bg-casino-800 rounded-xl p-4 border border-casino-600">
        <div className="flex gap-2">
          {(["gold", "sweeps"] as Currency[]).map((c) => (
            <button
              key={c}
              onClick={() => { setCurrency(c); setBetIndex(2); }}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                currency === c
                  ? "bg-gradient-gold text-casino-900"
                  : "bg-casino-700 text-white/60 hover:text-white"
              )}
            >
              {c === "gold" ? "🪙 Gold Coins" : "💎 Sweeps Coins"}
            </button>
          ))}
        </div>
        <div className="text-sm text-white/50">{balanceLabel}</div>
      </div>

      {/* Slot Machine Cabinet */}
      <div className="w-full max-w-2xl bg-casino-800 rounded-2xl border-2 border-casino-500 shadow-casino overflow-hidden">
        {/* Cabinet top */}
        <div className="bg-gradient-to-r from-casino-700 via-casino-600 to-casino-700 px-6 py-3 flex items-center justify-between border-b border-casino-500">
          <div className="text-gold-400 font-display text-lg font-semibold text-glow-gold">LUCKY SPINS</div>
          <div className="text-white/50 text-xs">9 PAYLINES</div>
        </div>

        {/* Reels */}
        <div className="p-6">
          <div className="flex gap-2 justify-center mb-4">
            {displayGrid.map((col, colIdx) => (
              <div
                key={colIdx}
                className={cn(
                  "flex flex-col bg-casino-950 rounded-lg border-2 overflow-hidden w-[88px] transition-all",
                  lockedReels[colIdx] ? "border-casino-500" : "border-gold-400/50"
                )}
              >
                {col.map((symId, rowIdx) => {
                  const isWinCell = winningLines.some(
                    (li) => PAYLINES[li][colIdx] === rowIdx && lockedReels[colIdx]
                  );
                  return (
                    <div
                      key={rowIdx}
                      className={cn(
                        "h-[72px] flex items-center justify-center text-4xl select-none transition-all",
                        isWinCell && "bg-gold-400/10 animate-bounce-win"
                      )}
                    >
                      {getSymbol(symId).emoji}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Win message */}
          <div className="text-center h-8 mb-2">
            {message && (
              <p className={cn(
                "text-sm font-semibold",
                lastWin ? "text-win animate-bounce-win" : "text-white/50"
              )}>
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="px-6 pb-6 space-y-4">
          {/* Bet selector */}
          <div className="flex items-center gap-2 justify-center">
            <span className="text-white/50 text-xs w-20 text-right">Bet/line:</span>
            <div className="flex gap-1.5 flex-wrap justify-center">
              {betOptions.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setBetIndex(idx)}
                  className={cn(
                    "px-2.5 py-1 rounded text-xs font-medium transition-all",
                    betIndex === idx
                      ? "bg-gold-400 text-casino-900"
                      : "bg-casino-700 text-white/60 hover:text-white"
                  )}
                >
                  {currency === "gold" ? opt.toLocaleString() : opt.toFixed(2)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-white/40 text-xs">Total Bet</div>
              <div className="text-gold-400 font-semibold text-sm">
                {currency === "gold" ? totalBet.toLocaleString() : totalBet.toFixed(2)}{" "}
                {currency === "gold" ? "GC" : "SC"}
              </div>
            </div>

            <Button
              variant="gold"
              size="xl"
              onClick={spin}
              disabled={spinning || balance < totalBet}
              className="px-12 rounded-full animate-pulse-gold disabled:animate-none"
            >
              {spinning ? "SPINNING..." : "SPIN"}
            </Button>

            <div className="text-center">
              <div className="text-white/40 text-xs">Last Win</div>
              <div className={cn("font-semibold text-sm", lastWin ? "text-win" : "text-white/30")}>
                {lastWin != null
                  ? currency === "gold"
                    ? `${lastWin.toLocaleString()} GC`
                    : `${lastWin.toFixed(2)} SC`
                  : "—"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Paytable */}
      <div className="w-full max-w-2xl bg-casino-800 rounded-xl border border-casino-600 p-4">
        <h3 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-3">Paytable (×bet/line)</h3>
        <div className="grid grid-cols-3 gap-2">
          {SYMBOLS.map((sym) => (
            <div key={sym.id} className="flex items-center gap-2 text-xs">
              <span className="text-xl">{sym.emoji}</span>
              <span className="text-white/60">{sym.label}</span>
              <span className="ml-auto text-gold-400 font-mono">
                {sym.pays[2]}×&nbsp;{sym.pays[3]}×&nbsp;{sym.pays[4]}×
              </span>
            </div>
          ))}
        </div>
        <p className="text-white/30 text-xs mt-3">3× / 4× / 5× match (left to right). Wild substitutes for any symbol.</p>
      </div>
    </div>
  );
}

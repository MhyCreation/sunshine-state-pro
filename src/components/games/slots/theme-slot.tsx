"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useWalletStore, type Currency } from "@/lib/store";
import { placeBet, recordWin } from "@/lib/actions/games";
import { Button } from "@/components/ui/button";
import {
  makeGrid, evalPaylines, countSymbol, expandWildsInGrid,
  type Grid, type LineWin,
} from "@/lib/slot-engine";
import { type SlotConfig } from "./slot-configs";

const BET_OPTIONS_GC = [100, 250, 500, 1000, 2500, 5000];
const BET_OPTIONS_SC = [0.1, 0.25, 0.5, 1, 2.5, 5];

// ─── Pick Bonus ─────────────────────────────────────────────────────────────

type ChestItem =
  | { kind: "coins"; label: string; mult: number }
  | { kind: "key";   label: string }
  | { kind: "end";   label: string };

function buildChests(totalBet: number): ChestItem[] {
  const prizes: ChestItem[] = [
    { kind: "coins", label: `${(totalBet * 5).toLocaleString()}`, mult: 5 },
    { kind: "coins", label: `${(totalBet * 10).toLocaleString()}`, mult: 10 },
    { kind: "coins", label: `${(totalBet * 20).toLocaleString()}`, mult: 20 },
    { kind: "coins", label: `${(totalBet * 35).toLocaleString()}`, mult: 35 },
    { kind: "coins", label: `${(totalBet * 50).toLocaleString()}`, mult: 50 },
    { kind: "coins", label: `${(totalBet * 75).toLocaleString()}`, mult: 75 },
    { kind: "key",   label: "Key 🗝️" },
    { kind: "key",   label: "Key 🗝️" },
    { kind: "end",   label: "Bust 💀" },
  ];
  // Fisher-Yates shuffle
  for (let i = prizes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [prizes[i], prizes[j]] = [prizes[j], prizes[i]];
  }
  return prizes;
}

interface PickBonusState {
  chests: ChestItem[];
  revealed: Set<number>;
  keys: number;
  totalWin: number;
  done: boolean;
}

function PickBonusOverlay({
  state,
  currency,
  totalBet,
  onPick,
  onClose,
}: {
  state: PickBonusState;
  currency: Currency;
  totalBet: number;
  onPick: (idx: number) => void;
  onClose: () => void;
}) {
  const fmt = (n: number) =>
    currency === "gold" ? `🪙 ${n.toLocaleString()}` : `💎 ${n.toFixed(2)}`;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-black/70 backdrop-blur-sm">
      <div className="bg-stone-900 border border-amber-500/40 rounded-2xl p-6 max-w-sm w-full shadow-gold-glow mx-4">
        <h3 className="font-display text-xl font-bold text-amber-400 text-center mb-1">
          ☠️ Treasure Hunt
        </h3>
        <p className="text-white/50 text-xs text-center mb-4">
          Pick chests · Collect 3 keys for a jackpot!
        </p>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {state.chests.map((chest, i) => {
            const isRevealed = state.revealed.has(i);
            return (
              <button
                key={i}
                disabled={isRevealed || state.done}
                onClick={() => onPick(i)}
                className={cn(
                  "h-16 rounded-xl border-2 flex flex-col items-center justify-center text-xs font-medium transition-all",
                  isRevealed
                    ? chest.kind === "end"
                      ? "bg-lose/20 border-lose/40 text-lose"
                      : chest.kind === "key"
                        ? "bg-gold-400/20 border-gold-400/40 text-gold-400"
                        : "bg-win/20 border-win/40 text-win"
                    : "bg-stone-800 border-stone-600 hover:border-amber-500/60 text-2xl"
                )}
              >
                {isRevealed ? (
                  <>
                    <span className="text-base leading-none">
                      {chest.kind === "end" ? "💀" : chest.kind === "key" ? "🗝️" : "💰"}
                    </span>
                    <span className="text-[10px] mt-0.5 leading-none">{chest.label}</span>
                  </>
                ) : (
                  <span>📦</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex justify-between text-xs text-white/50 mb-3">
          <span>🗝️ Keys: <strong className="text-gold-400">{state.keys}/3</strong></span>
          <span>Won: <strong className="text-win">{fmt(state.totalWin)}</strong></span>
        </div>

        {state.keys >= 3 && (
          <div className="text-center text-win font-bold text-sm mb-3 animate-bounce-win">
            🎉 JACKPOT — 3 Keys collected!
          </div>
        )}

        {state.done && (
          <Button variant="gold" size="lg" onClick={onClose} className="w-full">
            Collect {fmt(state.totalWin)}
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Bonus Banner ────────────────────────────────────────────────────────────

function BonusBanner({ text, sub }: { text: string; sub?: string }) {
  return (
    <div className="absolute inset-x-0 top-4 z-10 flex justify-center pointer-events-none">
      <div className="px-6 py-2 rounded-full bg-gold-400/90 text-casino-900 font-display font-bold text-lg shadow-gold-glow animate-bounce-win">
        {text}
        {sub && <span className="ml-2 font-normal text-sm opacity-70">{sub}</span>}
      </div>
    </div>
  );
}

// ─── Main ThemeSlot Component ─────────────────────────────────────────────────

type BonusMode =
  | { kind: "free_spins"; left: number; totalWin: number }
  | { kind: "cascade";    left: number; multiplier: number; totalWin: number }
  | { kind: "sticky";     locked: boolean[]; respins: number; totalWin: number }
  | { kind: "storm";      left: number; totalWin: number }
  | null;

export function ThemeSlot({ config }: { config: SlotConfig }) {
  const wildId    = config.symbols.find((s) => s.isWild)?.id ?? "";
  const scatterId = config.symbols.find((s) => s.isScatter)?.id ?? "";

  // Grid state
  const [grid,       setGrid]        = useState<Grid>(() => makeGrid(config.symbols));
  const [randomGrid, setRandomGrid]  = useState<Grid>(() => makeGrid(config.symbols));
  const [locked,     setLocked]      = useState([true, true, true, true, true]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Bet
  const [currency, setCurrency] = useState<Currency>("gold");
  const [betIdx,   setBetIdx]   = useState(2);

  // Results
  const [winLines, setWinLines]   = useState<LineWin[]>([]);
  const [lastWin,  setLastWin]    = useState<number | null>(null);
  const [message,  setMessage]    = useState<string | null>(null);

  // Bonus
  const [bonusMode,      setBonusMode]      = useState<BonusMode>(null);
  const [bonusSessionId, setBonusSessionId] = useState("");
  const [bonusBanner,    setBonusBanner]    = useState<string | null>(null);
  const [pickBonus,      setPickBonus]      = useState<PickBonusState | null>(null);

  const { goldCoins, sweepsCoins, deductBet, addWin } = useWalletStore();
  const betOptions = currency === "gold" ? BET_OPTIONS_GC : BET_OPTIONS_SC;
  const betPerLine = betOptions[betIdx];
  const totalBet   = betPerLine * config.lineCount;
  const balance    = currency === "gold" ? goldCoins : sweepsCoins;
  const buyBonusCost = totalBet * config.buyBonusMult;
  const spinning     = locked.some((l) => !l);

  const fmt = useCallback(
    (n: number) =>
      currency === "gold" ? `${Math.round(n).toLocaleString()} GC` : `${n.toFixed(2)} SC`,
    [currency]
  );

  // Display grid: show random for unlocked reels; show all-wild for sticky locked reels
  const displayGrid = locked.map((isLocked, col) => {
    if (bonusMode?.kind === "sticky" && bonusMode.locked[col]) return [wildId, wildId, wildId];
    return isLocked ? grid[col] : randomGrid[col];
  });

  // Win cell highlighting
  const winPositions = new Set(winLines.flatMap((w) => w.positions.map(([c, r]) => `${c},${r}`)));
  const isWinCell = (col: number, row: number) => winPositions.has(`${col},${row}`);

  // ── Animate reels ──
  const animateAndStop = useCallback(
    (finalGrid: Grid, bonusOverrideGrid?: Grid, onDone?: () => void) => {
      setLocked([false, false, false, false, false]);
      setWinLines([]);
      setLastWin(null);
      setMessage(null);

      intervalRef.current = setInterval(() => setRandomGrid(makeGrid(config.symbols)), 80);

      const stopGrid = bonusOverrideGrid ?? finalGrid;
      const delays = [900, 1300, 1700, 2100, 2500];
      delays.forEach((delay, col) => {
        setTimeout(() => {
          setLocked((prev) => prev.map((v, i) => (i === col ? true : v)));
          setGrid((prev) => prev.map((c, i) => (i === col ? stopGrid[col] : c)));
        }, delay);
      });

      setTimeout(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setGrid(stopGrid);
        setLocked([true, true, true, true, true]);
        onDone?.();
      }, 2800);
    },
    [config.symbols]
  );

  // ── Regular Spin ─────────────────────────────────────────────────────────────
  const spin = useCallback(async () => {
    if (spinning || bonusMode) return;
    if (balance < totalBet) { setMessage("Insufficient balance"); return; }

    deductBet(currency, totalBet);
    setMessage(null);

    const { sessionId, error } = await placeBet("slots", currency, totalBet);
    if (error) { addWin(currency, totalBet); setMessage(error); return; }

    let finalGrid = makeGrid(config.symbols);

    // Expanding wilds applied immediately (for non-bonus free spins)
    const displayFinal =
      config.bonus.expandingWilds
        ? expandWildsInGrid(finalGrid, wildId)
        : finalGrid;

    animateAndStop(finalGrid, displayFinal, async () => {
      const evalGrid = config.bonus.expandingWilds ? displayFinal : finalGrid;
      const { total, wins } = evalPaylines(evalGrid, config.symbols, config.lines, betPerLine);
      const scatters = countSymbol(finalGrid, scatterId);

      setWinLines(wins);

      // Check scatter trigger
      if (scatters >= config.bonus.scatterCount) {
        setLastWin(total);
        if (total > 0) { addWin(currency, total); }
        await recordWin(sessionId, total);
        await triggerBonus();
        return;
      }

      if (total > 0) {
        addWin(currency, total);
        setLastWin(total);
        setMessage(`🎉 You won ${fmt(total)}!`);
        await recordWin(sessionId, total);
      } else {
        setMessage("No win this time");
        await recordWin(sessionId, 0);
      }
    });
  }, [spinning, bonusMode, balance, totalBet, currency, betPerLine, config, wildId, scatterId, deductBet, addWin, animateAndStop, fmt]);

  // ── Trigger Bonus (scatter or buy) ───────────────────────────────────────────
  const triggerBonus = useCallback(async (fromBuy = false) => {
    const cost = fromBuy ? buyBonusCost : 0;
    if (fromBuy) {
      if (balance < buyBonusCost) { setMessage("Insufficient balance"); return; }
      deductBet(currency, buyBonusCost);
    }

    const { sessionId, error } = await placeBet("slots", currency, fromBuy ? buyBonusCost : totalBet);
    if (error) {
      if (fromBuy) addWin(currency, buyBonusCost);
      setMessage(error);
      return;
    }
    setBonusSessionId(sessionId);

    const { kind } = config.bonus;
    setBonusBanner(`🎰 ${config.bonus.name} Triggered!`);
    setTimeout(() => setBonusBanner(null), 2000);

    if (kind === "free_spins") {
      setBonusMode({ kind: "free_spins", left: config.bonus.freeSpinCount!, totalWin: 0 });
    } else if (kind === "cascade") {
      setBonusMode({ kind: "cascade", left: config.bonus.cascadeSpins!, multiplier: 1, totalWin: 0 });
    } else if (kind === "sticky_wilds") {
      setBonusMode({ kind: "sticky", locked: [false,false,false,false,false], respins: config.bonus.respinCount!, totalWin: 0 });
    } else if (kind === "storm") {
      setBonusMode({ kind: "storm", left: config.bonus.stormSpins!, totalWin: 0 });
    } else if (kind === "pick_bonus") {
      setPickBonus({
        chests: buildChests(totalBet),
        revealed: new Set(),
        keys: 0,
        totalWin: 0,
        done: false,
      });
    }
  }, [balance, buyBonusCost, currency, totalBet, config, deductBet, addWin]);

  const buyBonus = useCallback(() => {
    if (spinning || bonusMode || pickBonus) return;
    triggerBonus(true);
  }, [spinning, bonusMode, pickBonus, triggerBonus]);

  // ── Bonus Spins ──────────────────────────────────────────────────────────────
  const doBonusSpin = useCallback(() => {
    if (!bonusMode || spinning) return;

    const rawGrid = makeGrid(config.symbols);

    let finalGrid: Grid = rawGrid;
    let multiplier = 1;

    if (bonusMode.kind === "free_spins" && config.bonus.expandingWilds) {
      finalGrid = expandWildsInGrid(rawGrid, wildId);
    }
    if (bonusMode.kind === "cascade") {
      multiplier = bonusMode.multiplier;
    }
    if (bonusMode.kind === "storm") {
      // multiplier assigned after win check below
    }

    // For sticky: lock cols in the final grid
    if (bonusMode.kind === "sticky") {
      finalGrid = finalGrid.map((col, ci) =>
        bonusMode.locked[ci] ? [wildId, wildId, wildId] : col
      );
    }

    animateAndStop(rawGrid, finalGrid, async () => {
      let { total, wins } = evalPaylines(finalGrid, config.symbols, config.lines, betPerLine, multiplier);

      // Storm: apply random multiplier to wins
      if (bonusMode.kind === "storm" && total > 0) {
        const min = config.bonus.stormMinMult ?? 3;
        const max = config.bonus.stormMaxMult ?? 10;
        const stormMult = Math.floor(Math.random() * (max - min + 1)) + min;
        total = Math.round(total * stormMult);
        wins = wins.map((w) => ({ ...w, amount: Math.round(w.amount * stormMult) }));
        setMessage(`⚡ Lightning ${stormMult}× — won ${fmt(total)}!`);
      } else if (total > 0) {
        setMessage(`Bonus win: +${fmt(total)}`);
      } else {
        setMessage("No win this spin");
      }

      setWinLines(wins);
      setLastWin(total);

      // Handle sticky wilds: detect new wilds, lock those cols, reset respins
      if (bonusMode.kind === "sticky") {
        const newLocked = finalGrid.map((col, ci) =>
          bonusMode.locked[ci] || col.some((id) => id === wildId)
        );
        const gotNewWild = newLocked.some((v, i) => v && !bonusMode.locked[i]);
        const allLocked = newLocked.every(Boolean);

        if (allLocked) {
          const jackpot = Math.round(totalBet * (config.bonus.jackpotMult ?? 200));
          const finalTotal = bonusMode.totalWin + jackpot;
          addWin(currency, finalTotal);
          await recordWin(bonusSessionId, finalTotal);
          setMessage(`🌟 JACKPOT! All reels locked! +${fmt(jackpot)} jackpot!`);
          setLastWin(jackpot);
          setBonusMode(null);
          setBonusSessionId("");
          return;
        }

        const nextRespins = gotNewWild ? config.bonus.respinCount! : bonusMode.respins - 1;
        if (nextRespins <= 0) {
          const finalTotal = bonusMode.totalWin + total;
          if (finalTotal > 0) { addWin(currency, finalTotal); }
          await recordWin(bonusSessionId, finalTotal);
          setMessage(`Cosmic Lock ended! Total: +${fmt(finalTotal)}`);
          setBonusMode(null);
          setBonusSessionId("");
        } else {
          setBonusMode({ kind: "sticky", locked: newLocked, respins: nextRespins, totalWin: bonusMode.totalWin + total });
        }
        return;
      }

      // Handle free spins
      if (bonusMode.kind === "free_spins") {
        const next = bonusMode.left - 1;
        const runningWin = bonusMode.totalWin + total;
        if (next <= 0) {
          if (runningWin > 0) { addWin(currency, runningWin); }
          await recordWin(bonusSessionId, runningWin);
          setMessage(`Paradise Free Spins ended! Total: +${fmt(runningWin)}`);
          setBonusMode(null);
          setBonusSessionId("");
        } else {
          setBonusMode({ kind: "free_spins", left: next, totalWin: runningWin });
        }
        return;
      }

      // Handle cascade
      if (bonusMode.kind === "cascade") {
        const next = bonusMode.left - 1;
        const nextMult = Math.min(bonusMode.multiplier + 1, config.bonus.maxCascadeMult ?? 5);
        const runningWin = bonusMode.totalWin + total;
        if (next <= 0) {
          if (runningWin > 0) { addWin(currency, runningWin); }
          await recordWin(bonusSessionId, runningWin);
          setMessage(`Dragon Rage ended! Total: +${fmt(runningWin)}`);
          setBonusMode(null);
          setBonusSessionId("");
        } else {
          setBonusMode({ kind: "cascade", left: next, multiplier: nextMult, totalWin: runningWin });
        }
        return;
      }

      // Handle storm
      if (bonusMode.kind === "storm") {
        const next = bonusMode.left - 1;
        const runningWin = bonusMode.totalWin + total;
        if (next <= 0) {
          if (runningWin > 0) { addWin(currency, runningWin); }
          await recordWin(bonusSessionId, runningWin);
          setMessage(`Storm Mode ended! Total: +${fmt(runningWin)}`);
          setBonusMode(null);
          setBonusSessionId("");
        } else {
          setBonusMode({ kind: "storm", left: next, totalWin: runningWin });
        }
      }
    });
  }, [bonusMode, spinning, config, wildId, betPerLine, totalBet, currency, bonusSessionId, addWin, animateAndStop, fmt]);

  // ── Pick Bonus Handler ────────────────────────────────────────────────────────
  const handleChestPick = useCallback((idx: number) => {
    if (!pickBonus || pickBonus.revealed.has(idx) || pickBonus.done) return;
    const chest = pickBonus.chests[idx];
    const revealed = new Set(pickBonus.revealed).add(idx);

    if (chest.kind === "end") {
      const jackpot = pickBonus.keys >= 3 ? totalBet * 100 : 0;
      const finalWin = pickBonus.totalWin + jackpot;
      setPickBonus({ ...pickBonus, revealed, done: true, totalWin: finalWin });
    } else if (chest.kind === "key") {
      const keys = pickBonus.keys + 1;
      const jackpot = keys >= 3 ? totalBet * 100 : 0;
      if (jackpot > 0) {
        setPickBonus({ ...pickBonus, revealed, keys, totalWin: pickBonus.totalWin + jackpot, done: true });
      } else {
        setPickBonus({ ...pickBonus, revealed, keys });
      }
    } else {
      const prize = totalBet * chest.mult;
      setPickBonus({ ...pickBonus, revealed, totalWin: pickBonus.totalWin + prize });
    }
  }, [pickBonus, totalBet]);

  const closePickBonus = useCallback(async () => {
    if (!pickBonus) return;
    const finalWin = pickBonus.totalWin;
    if (finalWin > 0) { addWin(currency, finalWin); }
    await recordWin(bonusSessionId, finalWin);
    setMessage(finalWin > 0 ? `Treasure Hunt: +${fmt(finalWin)}!` : "Better luck next time!");
    setPickBonus(null);
    setBonusMode(null);
    setBonusSessionId("");
  }, [pickBonus, currency, bonusSessionId, addWin, fmt]);

  // ── Bonus info ────────────────────────────────────────────────────────────────
  const bonusLabel = bonusMode
    ? bonusMode.kind === "free_spins"  ? `FREE SPIN (${bonusMode.left} left)`
    : bonusMode.kind === "cascade"     ? `DRAGON RAGE — ${bonusMode.multiplier}× MULT (${bonusMode.left} left)`
    : bonusMode.kind === "sticky"      ? `COSMIC LOCK — ${bonusMode.respins} RESPINS`
    : bonusMode.kind === "storm"       ? `⚡ STORM — ${bonusMode.left} spins left`
    : null
    : null;

  // ── Main action button ────────────────────────────────────────────────────────
  const canNormalSpin = !spinning && !bonusMode && !pickBonus && balance >= totalBet;
  const canBonusSpin  = bonusMode !== null && !pickBonus && !spinning;
  const canBuy        = !spinning && !bonusMode && !pickBonus && balance >= buyBonusCost;

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Currency / Balance */}
      <div className={cn("w-full max-w-3xl flex flex-wrap items-center justify-between gap-3 rounded-xl p-4 border", config.theme.cabinetBg)}>
        <div className="flex gap-2">
          {(["gold", "sweeps"] as Currency[]).map((c) => (
            <button
              key={c}
              disabled={!!bonusMode || !!pickBonus || spinning}
              onClick={() => { setCurrency(c); setBetIdx(2); }}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all disabled:opacity-40",
                currency === c ? "bg-gradient-gold text-casino-900" : "bg-casino-700 text-white/60 hover:text-white"
              )}
            >
              {c === "gold" ? "🪙 Gold" : "💎 Sweeps"}
            </button>
          ))}
        </div>
        <div className="text-sm text-white/50">
          {currency === "gold" ? `🪙 ${goldCoins.toLocaleString()}` : `💎 ${sweepsCoins.toFixed(2)}`}
        </div>
      </div>

      {/* Cabinet */}
      <div className={cn("w-full max-w-3xl rounded-2xl border-2 overflow-hidden shadow-casino relative", config.theme.cabinetBg)}>
        {/* Pick bonus overlay */}
        {pickBonus && (
          <PickBonusOverlay
            state={pickBonus}
            currency={currency}
            totalBet={totalBet}
            onPick={handleChestPick}
            onClose={closePickBonus}
          />
        )}

        {/* Bonus banner */}
        {bonusBanner && <BonusBanner text={bonusBanner} />}

        {/* Header */}
        <div className={cn("bg-gradient-to-r px-6 py-3 flex items-center justify-between border-b border-white/10", config.theme.headerGradient)}>
          <div className={cn("font-display text-lg font-bold", config.theme.accentText)}>{config.name.toUpperCase()}</div>
          <div className="text-white/40 text-xs">{config.lineCount} PAYLINES</div>
        </div>

        {/* Reels */}
        <div className="p-5">
          {/* Bonus status bar */}
          {bonusLabel && (
            <div className={cn("text-center text-xs font-bold px-4 py-1.5 rounded-full mb-3 inline-block w-full", config.theme.accentText, "bg-white/5 border border-current/20")}>
              {bonusLabel}
            </div>
          )}

          <div className="flex gap-2 justify-center mb-4">
            {displayGrid.map((col, colIdx) => (
              <div
                key={colIdx}
                className={cn(
                  "flex flex-col bg-casino-950 rounded-lg border-2 overflow-hidden w-[80px] transition-all",
                  locked[colIdx]
                    ? (bonusMode?.kind === "sticky" && bonusMode.locked[colIdx] ? config.theme.borderActive : "border-casino-600")
                    : config.theme.borderActive
                )}
              >
                {col.map((symId, rowIdx) => {
                  const sym = config.symbols.find((s) => s.id === symId);
                  const isWin = isWinCell(colIdx, rowIdx);
                  return (
                    <div
                      key={rowIdx}
                      className={cn(
                        "h-[68px] flex items-center justify-center text-3xl select-none transition-all",
                        isWin && "animate-bounce-win"
                      )}
                      style={isWin ? { background: "rgba(245,197,71,0.08)" } : undefined}
                    >
                      {sym?.emoji ?? "❓"}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Message */}
          <div className="text-center min-h-[24px]">
            {message && (
              <p className={cn("text-sm font-semibold", lastWin && lastWin > 0 ? config.theme.winText : "text-white/40")}>
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="px-5 pb-5 space-y-3">
          {/* Bet selector */}
          <div className="flex items-center gap-2 justify-center flex-wrap">
            <span className="text-white/40 text-xs">Bet/line:</span>
            {betOptions.map((opt, i) => (
              <button
                key={i}
                disabled={!!bonusMode || !!pickBonus || spinning}
                onClick={() => setBetIdx(i)}
                className={cn(
                  "px-2.5 py-1 rounded text-xs font-medium transition-all disabled:opacity-40",
                  betIdx === i ? "bg-gold-400 text-casino-900" : "bg-casino-700 text-white/60 hover:text-white"
                )}
              >
                {currency === "gold" ? opt.toLocaleString() : opt.toFixed(2)}
              </button>
            ))}
          </div>

          {/* Main buttons row */}
          <div className="flex items-center gap-3">
            {/* Spin / Free Spin / Respin */}
            <Button
              variant="gold"
              size="xl"
              className="flex-1 rounded-full animate-pulse-gold disabled:animate-none"
              disabled={!canNormalSpin && !canBonusSpin}
              onClick={canBonusSpin ? doBonusSpin : spin}
            >
              {spinning
                ? "SPINNING…"
                : canBonusSpin
                  ? bonusMode?.kind === "sticky" ? "RESPIN" : "FREE SPIN"
                  : "SPIN"}
            </Button>

            {/* Buy Bonus */}
            {!bonusMode && !pickBonus && (
              <div className="flex flex-col items-center gap-0.5">
                <Button
                  variant="outline"
                  size="default"
                  disabled={!canBuy || spinning}
                  onClick={buyBonus}
                  className={cn("text-xs border", config.theme.accentText, "border-current/30 hover:bg-white/5")}
                >
                  🎰 Buy Bonus
                </Button>
                <span className="text-[10px] text-white/30">
                  {currency === "gold"
                    ? `${buyBonusCost.toLocaleString()} GC`
                    : `${buyBonusCost.toFixed(2)} SC`}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-between text-xs text-white/30">
            <span>Total bet: {currency === "gold" ? totalBet.toLocaleString() : totalBet.toFixed(2)} {currency === "gold" ? "GC" : "SC"}</span>
            <span>Last win: {lastWin != null ? (currency === "gold" ? lastWin.toLocaleString() : lastWin.toFixed(2)) : "—"}</span>
          </div>
        </div>
      </div>

      {/* Bonus description card */}
      <div className={cn("w-full max-w-3xl rounded-xl border p-4", config.theme.cabinetBg)}>
        <div className={cn("text-xs font-bold uppercase tracking-wider mb-1", config.theme.accentText)}>
          {config.bonus.name} · Buy for {config.buyBonusMult}× bet
        </div>
        <p className="text-white/40 text-xs">{config.bonus.description}</p>
      </div>

      {/* Paytable */}
      <div className={cn("w-full max-w-3xl rounded-xl border p-4", config.theme.cabinetBg)}>
        <div className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">Paytable (×bet/line)</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {config.symbols.filter((s) => !s.isScatter).map((sym) => (
            <div key={sym.id} className="flex items-center gap-2 text-xs">
              <span className="text-2xl">{sym.emoji}</span>
              <div>
                <div className="text-white/60 leading-none">{sym.label}</div>
                <div className={cn("font-mono text-[10px]", config.theme.accentText)}>
                  {sym.pays[0]}× {sym.pays[1]}× {sym.pays[2]}×
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-white/20 text-[10px] mt-3">
          3× / 4× / 5× consecutive from left. Scatter ({config.symbols.find(s => s.isScatter)?.emoji}) triggers {config.bonus.name} ({config.bonus.scatterCount}+ needed). RTP {config.rtp}
        </p>
      </div>
    </div>
  );
}

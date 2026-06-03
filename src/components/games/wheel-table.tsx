"use client";

import { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { useWalletStore, type Currency } from "@/lib/store";
import { placeBet, recordWin } from "@/lib/actions/games";
import { Button } from "@/components/ui/button";

const BET_GC = [100, 250, 500, 1000, 2500];
const BET_SC = [0.1, 0.25, 0.5, 1, 2.5];

// 30 segments: 7×"2x", 1×"5x", 1×"10x", 21×"lose"  → ~96.7% RTP
const SEGMENTS = [
  ...Array(21).fill({ label: "✕", mult: 0, color: "#374151" }),
  ...Array(7).fill({ label: "2×", mult: 2, color: "#ef4444" }),
  { label: "5×", mult: 5, color: "#8b5cf6" },
  { label: "10×", mult: 10, color: "#f5c842" },
];
// Shuffle for visual variety
const WHEEL = [...SEGMENTS].sort(() => Math.random() - 0.5);

function spinResult(): number {
  const r = Math.random();
  if (r < 21 / 30) return -1; // lose: index into lose segments
  const payIdx = Math.floor(r * 30); // 0-29
  // find a paying segment
  let payCnt = 0;
  for (let i = 0; i < WHEEL.length; i++) {
    if (WHEEL[i].mult > 0) {
      if (payCnt === 0 && r > 21 / 30 && r < 28 / 30) return i; // 2x
      if (payCnt === 1 && r >= 28 / 30 && r < 29 / 30) return i; // 5x
      if (payCnt === 2 && r >= 29 / 30) return i; // 10x
      payCnt++;
    }
  }
  return 0;
}

function pickSegment(): number {
  const r = Math.random() * 30;
  const idx = Math.floor(r);
  return idx;
}

export function WheelTable() {
  const [currency, setCurrency] = useState<Currency>("gold");
  const [betIdx, setBetIdx] = useState(1);
  const [phase, setPhase] = useState<"idle" | "spinning" | "result">("idle");
  const [rotation, setRotation] = useState(0);
  const [landedIdx, setLandedIdx] = useState<number | null>(null);
  const [winAmount, setWinAmount] = useState(0);
  const rotationRef = useRef(0);

  const { goldCoins, sweepsCoins, deductBet, addWin } = useWalletStore();
  const betOptions = currency === "gold" ? BET_GC : BET_SC;
  const bet = betOptions[betIdx];
  const balance = currency === "gold" ? goldCoins : sweepsCoins;

  const spin = useCallback(async () => {
    if (phase !== "idle" || balance < bet) return;
    setPhase("spinning");
    setLandedIdx(null);
    deductBet(currency, bet);

    const { sessionId, error } = await placeBet("wheel", currency, bet);
    if (error) { addWin(currency, bet); setPhase("idle"); return; }

    const targetIdx = pickSegment();
    const segDeg = 360 / 30;
    // Rotate so targetIdx lands at top (needle at top)
    const targetDeg = targetIdx * segDeg + segDeg / 2;
    const spins = 5 + Math.random() * 3; // 5-8 full rotations
    const totalDeg = rotationRef.current + spins * 360 + (360 - targetDeg);
    rotationRef.current = totalDeg;
    setRotation(totalDeg);

    await new Promise<void>(r => setTimeout(r, 4200));

    const seg = WHEEL[targetIdx];
    setLandedIdx(targetIdx);
    const win = seg.mult > 0 ? (currency === "gold" ? Math.round(bet * seg.mult) : Math.round(bet * seg.mult * 100) / 100) : 0;
    setWinAmount(win);
    if (win > 0) addWin(currency, win);
    await recordWin(sessionId, win, { segment: seg.label, multiplier: seg.mult });
    setPhase("result");
  }, [phase, balance, bet, currency, deductBet, addWin]);

  function reset() { setPhase("idle"); setLandedIdx(null); setWinAmount(0); }

  const landed = landedIdx !== null ? WHEEL[landedIdx] : null;
  const segDeg = 360 / 30;

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

      {/* Wheel */}
      <div className="bg-casino-800 rounded-2xl border border-casino-600 p-8 flex flex-col items-center gap-4">
        {/* Needle */}
        <div className="text-2xl">▼</div>
        {/* Wheel visual */}
        <div className="relative w-64 h-64">
          <div
            className="w-full h-full rounded-full border-4 border-casino-600 overflow-hidden"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: phase === "spinning" ? "transform 4s cubic-bezier(0.17,0.67,0.12,0.99)" : "none",
              background: `conic-gradient(${WHEEL.map((s, i) => `${s.color} ${i * segDeg}deg ${(i + 1) * segDeg}deg`).join(", ")})`,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-casino-800 border-4 border-casino-600 flex items-center justify-center">
              <span className="text-white/40 text-xs font-bold">GO</span>
            </div>
          </div>
        </div>

        {/* Result */}
        {phase === "result" && landed && (
          <div className={cn("text-center", landed.mult > 0 ? "text-win" : "text-white/40")}>
            <p className="text-2xl font-black">{landed.label}</p>
            {landed.mult > 0 ? (
              <p className="text-sm">+{currency === "gold" ? winAmount.toLocaleString() : winAmount.toFixed(2)} {currency === "gold" ? "GC" : "SC"}</p>
            ) : (
              <p className="text-sm">No win this spin</p>
            )}
          </div>
        )}
        {phase === "spinning" && <p className="text-white/40 text-sm animate-pulse">Spinning…</p>}

        {/* Legend */}
        <div className="flex gap-4 text-xs">
          {[{ color: "#374151", label: "✕ lose", pct: "70%" }, { color: "#ef4444", label: "2×", pct: "23%" }, { color: "#8b5cf6", label: "5×", pct: "3.3%" }, { color: "#f5c842", label: "10×", pct: "3.3%" }].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color }} />
              <span className="text-white/40">{l.label} ({l.pct})</span>
            </div>
          ))}
        </div>
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
          <Button variant="gold" size="lg" className="w-full" onClick={reset}>Spin Again</Button>
        ) : (
          <Button variant="gold" size="lg" className="w-full" disabled={balance < bet || phase === "spinning"} onClick={spin}>
            {phase === "spinning" ? "Spinning…" : "Spin 🎡"}
          </Button>
        )}
      </div>
    </div>
  );
}

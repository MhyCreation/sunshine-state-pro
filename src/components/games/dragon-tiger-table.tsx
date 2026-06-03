"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useWalletStore, type Currency } from "@/lib/store";
import { placeBet, recordWin } from "@/lib/actions/games";
import { Button } from "@/components/ui/button";

type Suit = "♠" | "♥" | "♦" | "♣";
type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";
type Card = { suit: Suit; rank: Rank };
type BetType = "dragon" | "tiger" | "tie";

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
// Ace LOW in Dragon Tiger
const RANK_VALUE: Record<Rank, number> = { A: 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, J: 11, Q: 12, K: 13 };
const RED: Suit[] = ["♥", "♦"];
const BET_GC = [100, 250, 500, 1000, 2500];
const BET_SC = [0.1, 0.25, 0.5, 1, 2.5];

function randomCard(): Card {
  return { suit: SUITS[Math.floor(Math.random() * 4)], rank: RANKS[Math.floor(Math.random() * 13)] };
}

function CardFace({ card, highlight }: { card: Card; highlight?: "win" | "lose" }) {
  const red = RED.includes(card.suit);
  return (
    <div className={cn(
      "w-20 h-28 rounded-xl flex flex-col justify-between p-2 shadow-lg border-2 text-sm font-bold transition-all",
      highlight === "win" ? "border-win scale-110" : highlight === "lose" ? "border-red-500/50 opacity-70" : "border-transparent",
      red ? "bg-white text-red-600" : "bg-white text-slate-900"
    )}>
      <span>{card.rank}</span>
      <span className="text-3xl text-center">{card.suit}</span>
      <span className="self-end rotate-180">{card.rank}</span>
    </div>
  );
}

export function DragonTigerTable() {
  const [currency, setCurrency] = useState<Currency>("gold");
  const [betIdx, setBetIdx] = useState(1);
  const [betType, setBetType] = useState<BetType>("dragon");
  const [dragonCard, setDragonCard] = useState<Card | null>(null);
  const [tigerCard, setTigerCard] = useState<Card | null>(null);
  const [phase, setPhase] = useState<"betting" | "dealing" | "result">("betting");
  const [winner, setWinner] = useState<"dragon" | "tiger" | "tie" | null>(null);
  const [winAmount, setWinAmount] = useState(0);

  const { goldCoins, sweepsCoins, deductBet, addWin } = useWalletStore();
  const betOptions = currency === "gold" ? BET_GC : BET_SC;
  const bet = betOptions[betIdx];
  const balance = currency === "gold" ? goldCoins : sweepsCoins;

  const deal = useCallback(async () => {
    if (balance < bet || phase !== "betting") return;
    setPhase("dealing");
    deductBet(currency, bet);

    const { sessionId, error } = await placeBet("dragon-tiger", currency, bet);
    if (error) { addWin(currency, bet); setPhase("betting"); return; }

    const d = randomCard();
    const t = randomCard();
    const dv = RANK_VALUE[d.rank];
    const tv = RANK_VALUE[t.rank];
    const w: "dragon" | "tiger" | "tie" = dv > tv ? "dragon" : tv > dv ? "tiger" : "tie";

    let win = 0;
    if (betType === "dragon" && w === "dragon") win = bet * 2;
    else if (betType === "tiger" && w === "tiger") win = bet * 2;
    else if (betType === "tie" && w === "tie") win = bet * 9;
    else if ((betType === "dragon" || betType === "tiger") && w === "tie") win = bet; // push

    setDragonCard(d);
    setTigerCard(t);
    setWinner(w);
    setWinAmount(win);
    if (win > 0) addWin(currency, win);
    await recordWin(sessionId, win, { dragon: d, tiger: t, winner: w, betType });
    setPhase("result");
  }, [balance, bet, betType, currency, phase, deductBet, addWin]);

  function reset() { setDragonCard(null); setTigerCard(null); setWinner(null); setWinAmount(0); setPhase("betting"); }

  const getHighlight = (side: "dragon" | "tiger"): "win" | "lose" | undefined => {
    if (!winner) return undefined;
    if (winner === "tie") return undefined;
    return winner === side ? "win" : "lose";
  };

  return (
    <div className="space-y-6">
      {/* Currency */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-casino-800 rounded-2xl border border-casino-600 px-5 py-4">
        <div className="flex gap-2">
          {(["gold", "sweeps"] as Currency[]).map(c => (
            <button key={c} onClick={() => { if (phase === "betting") setCurrency(c); }}
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

      {/* Table */}
      <div className="bg-[#1a0a0a] rounded-2xl border border-[#4a1a1a] p-6">
        <div className="grid grid-cols-3 gap-4 items-center">
          {/* Dragon */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-white/50 text-xs font-bold uppercase tracking-widest">🐉 Dragon</span>
            {dragonCard ? <CardFace card={dragonCard} highlight={getHighlight("dragon")} /> : (
              <div className="w-20 h-28 rounded-xl border-2 border-dashed border-[#4a1a1a] flex items-center justify-center">
                <span className="text-4xl">🐉</span>
              </div>
            )}
          </div>

          {/* VS / Result */}
          <div className="flex flex-col items-center gap-2">
            {phase === "result" && winner ? (
              <div className={cn("text-center px-3 py-2 rounded-lg",
                winAmount > 0 ? "bg-win/10 border border-win/20" : "bg-white/5 border border-white/10")}>
                <p className={cn("text-base font-bold", winAmount > 0 ? "text-win" : "text-white/50")}>
                  {winner === "tie" ? "🤝 Tie" : winner === "dragon" ? "🐉 Dragon wins" : "🐯 Tiger wins"}
                </p>
                {winAmount > 0 && (
                  <p className="text-win text-xs mt-0.5">
                    +{currency === "gold" ? winAmount.toLocaleString() : winAmount.toFixed(2)} {currency === "gold" ? "GC" : "SC"}
                  </p>
                )}
              </div>
            ) : (
              <span className="text-white/20 text-2xl font-black">VS</span>
            )}
          </div>

          {/* Tiger */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-white/50 text-xs font-bold uppercase tracking-widest">🐯 Tiger</span>
            {tigerCard ? <CardFace card={tigerCard} highlight={getHighlight("tiger")} /> : (
              <div className="w-20 h-28 rounded-xl border-2 border-dashed border-[#4a1a1a] flex items-center justify-center">
                <span className="text-4xl">🐯</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bet */}
      <div className="bg-casino-800 rounded-2xl border border-casino-600 p-5 space-y-4">
        {phase === "betting" && (
          <>
            <div className="space-y-2">
              <span className="text-white/40 text-xs font-medium uppercase tracking-wider">Bet on</span>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { key: "dragon", label: "🐉 Dragon", sub: "1:1" },
                  { key: "tie",    label: "🤝 Tie",    sub: "8:1" },
                  { key: "tiger",  label: "🐯 Tiger",  sub: "1:1" },
                ] as { key: BetType; label: string; sub: string }[]).map(({ key, label, sub }) => (
                  <button key={key} onClick={() => setBetType(key)}
                    className={cn("py-2.5 rounded-xl text-sm font-semibold transition-all border",
                      betType === key ? "bg-gold-400/10 border-gold-400/40 text-gold-400" : "bg-casino-700 border-transparent text-white/50 hover:text-white/80")}>
                    {label}<br /><span className="text-xs opacity-60">{sub}</span>
                  </button>
                ))}
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
            <Button variant="gold" size="lg" className="w-full" disabled={balance < bet} onClick={deal}>Deal</Button>
          </>
        )}
        {phase === "result" && (
          <Button variant="gold" size="lg" className="w-full" onClick={reset}>New Round</Button>
        )}
      </div>
    </div>
  );
}

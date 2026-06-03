"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useWalletStore, type Currency } from "@/lib/store";
import { placeBet, recordWin } from "@/lib/actions/games";
import { Button } from "@/components/ui/button";

type Suit = "♠" | "♥" | "♦" | "♣";
type Rank = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
type Card = { suit: Suit; rank: Rank };

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const RANKS: Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const RANK_VALUE: Record<Rank, number> = { "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, J: 11, Q: 12, K: 13, A: 14 };
const RED: Suit[] = ["♥", "♦"];
const BET_GC = [100, 250, 500, 1000, 2500];
const BET_SC = [0.1, 0.25, 0.5, 1, 2.5];

function randomCard(): Card {
  return { suit: SUITS[Math.floor(Math.random() * 4)], rank: RANKS[Math.floor(Math.random() * 13)] };
}

function CardFace({ card, highlight }: { card: Card; highlight?: "win" | "lose" | "tie" }) {
  const red = RED.includes(card.suit);
  return (
    <div className={cn(
      "w-24 h-32 rounded-xl flex flex-col justify-between p-2.5 shadow-lg border-2 text-sm font-bold transition-all",
      highlight === "win" ? "border-win ring-2 ring-win/30 scale-110" :
      highlight === "tie" ? "border-gold-400/60 ring-1 ring-gold-400/20" :
      highlight === "lose" ? "border-red-500/50 opacity-60" : "border-transparent",
      red ? "bg-white text-red-600" : "bg-white text-slate-900"
    )}>
      <span className="text-base">{card.rank}</span>
      <span className="text-4xl text-center">{card.suit}</span>
      <span className="self-end rotate-180 text-base">{card.rank}</span>
    </div>
  );
}

export function WarTable() {
  const [currency, setCurrency] = useState<Currency>("gold");
  const [betIdx, setBetIdx] = useState(1);
  const [playerCard, setPlayerCard] = useState<Card | null>(null);
  const [dealerCard, setDealerCard] = useState<Card | null>(null);
  const [phase, setPhase] = useState<"betting" | "dealing" | "result">("betting");
  const [outcome, setOutcome] = useState<"win" | "lose" | "tie" | null>(null);
  const [winAmount, setWinAmount] = useState(0);

  const { goldCoins, sweepsCoins, deductBet, addWin } = useWalletStore();
  const betOptions = currency === "gold" ? BET_GC : BET_SC;
  const bet = betOptions[betIdx];
  const balance = currency === "gold" ? goldCoins : sweepsCoins;

  const deal = useCallback(async () => {
    if (balance < bet || phase !== "betting") return;
    setPhase("dealing");
    deductBet(currency, bet);

    const { sessionId, error } = await placeBet("war", currency, bet);
    if (error) { addWin(currency, bet); setPhase("betting"); return; }

    const p = randomCard();
    const d = randomCard();
    const pv = RANK_VALUE[p.rank];
    const dv = RANK_VALUE[d.rank];
    const out: "win" | "lose" | "tie" = pv > dv ? "win" : pv < dv ? "lose" : "tie";

    let win = 0;
    if (out === "win") win = bet * 2;
    else if (out === "tie") win = bet; // push

    setPlayerCard(p);
    setDealerCard(d);
    setOutcome(out);
    setWinAmount(win);
    if (win > 0) addWin(currency, win);
    await recordWin(sessionId, win, { player: p, dealer: d, outcome: out });
    setPhase("result");
  }, [balance, bet, currency, phase, deductBet, addWin]);

  function reset() { setPlayerCard(null); setDealerCard(null); setOutcome(null); setWinAmount(0); setPhase("betting"); }

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

      {/* Cards */}
      <div className="bg-[#0d1a0d] rounded-2xl border border-[#1a3a1a] p-8">
        <div className="grid grid-cols-3 items-center gap-4">
          <div className="flex flex-col items-center gap-3">
            <span className="text-white/40 text-xs font-bold uppercase tracking-widest">You</span>
            {playerCard ? <CardFace card={playerCard} highlight={outcome ?? undefined} /> : (
              <div className="w-24 h-32 rounded-xl border-2 border-dashed border-[#1a3a1a] flex items-center justify-center">
                <span className="text-white/20 text-2xl">?</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 text-center">
            {phase === "result" && outcome ? (
              <div className={cn("px-4 py-3 rounded-xl border",
                outcome === "win" ? "bg-win/10 border-win/30 text-win" :
                outcome === "tie" ? "bg-gold-400/10 border-gold-400/30 text-gold-400" :
                "bg-red-500/10 border-red-500/30 text-red-400")}>
                <p className="text-lg font-black">{outcome === "win" ? "🏆 You Win!" : outcome === "tie" ? "🤝 Tie!" : "💀 Dealer Wins"}</p>
                {winAmount > 0 && <p className="text-sm mt-0.5">+{currency === "gold" ? winAmount.toLocaleString() : winAmount.toFixed(2)} {currency === "gold" ? "GC" : "SC"}</p>}
              </div>
            ) : (
              <span className="text-white/20 text-3xl font-black">⚔</span>
            )}
          </div>

          <div className="flex flex-col items-center gap-3">
            <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Dealer</span>
            {dealerCard ? <CardFace card={dealerCard} highlight={outcome === "lose" ? "win" : outcome === "win" ? "lose" : outcome === "tie" ? "tie" : undefined} /> : (
              <div className="w-24 h-32 rounded-xl border-2 border-dashed border-[#1a3a1a] flex items-center justify-center">
                <span className="text-white/20 text-2xl">?</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bet + action */}
      <div className="bg-casino-800 rounded-2xl border border-casino-600 p-5 space-y-4">
        {phase === "betting" && (
          <>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-white/40 text-xs font-medium uppercase tracking-wider">Bet · Ace wins · Tie = push</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {betOptions.map((opt, i) => (
                <button key={i} onClick={() => setBetIdx(i)}
                  className={cn("px-4 py-1.5 rounded-lg text-sm font-bold transition-all border",
                    betIdx === i ? "bg-gold-400/10 border-gold-400/40 text-gold-400" : "bg-casino-700 border-transparent text-white/40 hover:text-white/70")}>
                  {currency === "gold" ? opt.toLocaleString() : opt.toFixed(2)}
                </button>
              ))}
            </div>
            <Button variant="gold" size="lg" className="w-full" disabled={balance < bet} onClick={deal}>
              ⚔ Go to War!
            </Button>
          </>
        )}
        {phase === "result" && (
          <Button variant="gold" size="lg" className="w-full" onClick={reset}>Play Again</Button>
        )}
      </div>
    </div>
  );
}

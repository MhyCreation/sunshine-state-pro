"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useWalletStore, type Currency } from "@/lib/store";
import { placeBet, recordWin } from "@/lib/actions/games";
import { Button } from "@/components/ui/button";

type Suit = "♠" | "♥" | "♦" | "♣";
type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";
type Card = { suit: Suit; rank: Rank };
type BetType = "player" | "banker" | "tie";

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const RED: Suit[] = ["♥", "♦"];
const BET_GC = [100, 250, 500, 1000, 2500];
const BET_SC = [0.1, 0.25, 0.5, 1, 2.5];

function buildShoe(): Card[] {
  const deck = SUITS.flatMap(s => RANKS.map(r => ({ suit: s, rank: r })));
  const shoe = Array.from({ length: 8 }, () => deck).flat();
  for (let i = shoe.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
  }
  return shoe;
}

function cardValue(c: Card): number {
  if (["J", "Q", "K", "10"].includes(c.rank)) return 0;
  if (c.rank === "A") return 1;
  return parseInt(c.rank);
}

function handTotal(cards: Card[]): number {
  return cards.reduce((sum, c) => (sum + cardValue(c)) % 10, 0);
}

function resolveThirdCards(
  pHand: Card[], bHand: Card[], shoe: Card[]
): { pHand: Card[]; bHand: Card[]; shoe: Card[] } {
  const pTotal = handTotal(pHand);
  const bTotal = handTotal(bHand);

  // Natural: no more cards
  if (pTotal >= 8 || bTotal >= 8) return { pHand, bHand, shoe };

  let s = [...shoe];
  let pDrewCard: Card | null = null;
  let newPHand = [...pHand];
  let newBHand = [...bHand];

  // Player draws on 0-5
  if (pTotal <= 5) {
    const [card, ...rest] = s; s = rest;
    pDrewCard = card;
    newPHand = [...newPHand, card];
  }

  // Banker drawing rules
  const newBTotal = handTotal(newBHand);
  let bankerDraws = false;
  if (pDrewCard === null) {
    bankerDraws = newBTotal <= 5;
  } else {
    const p3v = cardValue(pDrewCard);
    if (newBTotal <= 2) bankerDraws = true;
    else if (newBTotal === 3) bankerDraws = p3v !== 8;
    else if (newBTotal === 4) bankerDraws = [2, 3, 4, 5, 6, 7].includes(p3v);
    else if (newBTotal === 5) bankerDraws = [4, 5, 6, 7].includes(p3v);
    else if (newBTotal === 6) bankerDraws = [6, 7].includes(p3v);
  }

  if (bankerDraws) {
    const [card, ...rest] = s; s = rest;
    newBHand = [...newBHand, card];
  }

  return { pHand: newPHand, bHand: newBHand, shoe: s };
}

function CardFace({ card }: { card: Card }) {
  const red = RED.includes(card.suit);
  return (
    <div className={cn(
      "w-12 h-16 rounded-md bg-white flex flex-col justify-between p-1 text-xs font-bold shadow-lg",
      red ? "text-red-600" : "text-slate-900"
    )}>
      <span className="leading-none">{card.rank}</span>
      <span className="text-lg leading-none text-center">{card.suit}</span>
      <span className="leading-none self-end rotate-180">{card.rank}</span>
    </div>
  );
}

export function BaccaratTable() {
  const [currency, setCurrency] = useState<Currency>("gold");
  const [betIdx, setBetIdx] = useState(1);
  const [betType, setBetType] = useState<BetType>("player");
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [bankerHand, setBankerHand] = useState<Card[]>([]);
  const [phase, setPhase] = useState<"betting" | "dealing" | "result">("betting");
  const [winner, setWinner] = useState<"player" | "banker" | "tie" | null>(null);
  const [winAmount, setWinAmount] = useState(0);
  const [shoe, setShoe] = useState<Card[]>(() => buildShoe());

  const { goldCoins, sweepsCoins, deductBet, addWin } = useWalletStore();
  const betOptions = currency === "gold" ? BET_GC : BET_SC;
  const bet = betOptions[betIdx];
  const balance = currency === "gold" ? goldCoins : sweepsCoins;

  const deal = useCallback(async () => {
    if (balance < bet || phase !== "betting") return;
    setPhase("dealing");
    deductBet(currency, bet);

    const { sessionId, error } = await placeBet("baccarat", currency, bet);
    if (error) { addWin(currency, bet); setPhase("betting"); return; }

    let s = shoe.length < 20 ? buildShoe() : [...shoe];
    const [p1, ...s1] = s; s = s1;
    const [b1, ...s2] = s; s = s2;
    const [p2, ...s3] = s; s = s3;
    const [b2, ...s4] = s; s = s4;

    const { pHand, bHand, shoe: sRem } = resolveThirdCards([p1, p2], [b1, b2], s4);
    setShoe(sRem);
    setPlayerHand(pHand);
    setBankerHand(bHand);

    const pTotal = handTotal(pHand);
    const bTotal = handTotal(bHand);
    const w: "player" | "banker" | "tie" = pTotal > bTotal ? "player" : bTotal > pTotal ? "banker" : "tie";

    let win = 0;
    if (betType === "player" && w === "player") win = bet * 2;
    else if (betType === "banker" && w === "banker") win = Math.round(bet * 1.95 * 100) / 100;
    else if (betType === "tie" && w === "tie") win = bet * 9;
    else if ((betType === "player" || betType === "banker") && w === "tie") win = bet; // push

    if (win > 0) addWin(currency, win);
    setWinner(w);
    setWinAmount(win);
    await recordWin(sessionId, win, { playerTotal: pTotal, bankerTotal: bTotal, winner: w, betType });
    setPhase("result");
  }, [balance, bet, betType, currency, phase, shoe, deductBet, addWin]);

  function reset() {
    setPlayerHand([]);
    setBankerHand([]);
    setWinner(null);
    setWinAmount(0);
    setPhase("betting");
  }

  const BET_LABELS: Record<BetType, string> = {
    player: "Player 1:1",
    banker: "Banker 0.95:1",
    tie: "Tie 8:1",
  };

  return (
    <div className="space-y-6">
      {/* Currency */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-casino-800 rounded-2xl border border-casino-600 px-5 py-4">
        <div className="flex gap-2">
          {(["gold", "sweeps"] as Currency[]).map(c => (
            <button key={c} onClick={() => { if (phase === "betting") setCurrency(c); }}
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

      {/* Table */}
      <div className="bg-[#0a2210] rounded-2xl border border-[#1a4a1a] p-6 space-y-6">
        {/* Banker hand */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-xs font-semibold uppercase tracking-widest">Banker</span>
            {bankerHand.length > 0 && (
              <span className={cn(
                "text-sm font-bold rounded-full px-3 py-0.5",
                winner === "banker" ? "bg-win/20 text-win" : "bg-white/5 text-white/60"
              )}>
                {handTotal(bankerHand)}
              </span>
            )}
          </div>
          <div className="flex gap-2 min-h-[68px]">
            {bankerHand.map((c, i) => <CardFace key={i} card={c} />)}
          </div>
        </div>

        <div className="border-t border-white/5" />

        {/* Player hand */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-xs font-semibold uppercase tracking-widest">Player</span>
            {playerHand.length > 0 && (
              <span className={cn(
                "text-sm font-bold rounded-full px-3 py-0.5",
                winner === "player" ? "bg-win/20 text-win" : "bg-white/5 text-white/60"
              )}>
                {handTotal(playerHand)}
              </span>
            )}
          </div>
          <div className="flex gap-2 min-h-[68px]">
            {playerHand.map((c, i) => <CardFace key={i} card={c} />)}
          </div>
        </div>

        {/* Result overlay */}
        {phase === "result" && winner && (
          <div className={cn(
            "rounded-xl p-4 text-center",
            winAmount > 0 ? "bg-win/10 border border-win/20" : "bg-white/5 border border-white/10"
          )}>
            <p className={cn("text-xl font-bold", winAmount > 0 ? "text-win" : "text-white/60")}>
              {winner === "tie" ? "🤝 Tie!" : winner === "player" ? "👤 Player wins!" : "🏦 Banker wins!"}
            </p>
            {winAmount > 0 ? (
              <p className="text-win/80 text-sm mt-1">
                +{currency === "gold" ? winAmount.toLocaleString() : winAmount.toFixed(2)} {currency === "gold" ? "GC" : "SC"}
              </p>
            ) : (
              <p className="text-white/40 text-sm mt-1">Better luck next time</p>
            )}
          </div>
        )}
      </div>

      {/* Bet selector */}
      {phase === "betting" && (
        <div className="bg-casino-800 rounded-2xl border border-casino-600 p-5 space-y-4">
          <div className="space-y-2">
            <span className="text-white/40 text-xs font-medium uppercase tracking-wider">Bet on</span>
            <div className="grid grid-cols-3 gap-2">
              {(["player", "banker", "tie"] as BetType[]).map(t => (
                <button key={t} onClick={() => setBetType(t)}
                  className={cn(
                    "py-2.5 rounded-xl text-sm font-semibold transition-all border",
                    betType === t ? "bg-gold-400/10 border-gold-400/40 text-gold-400" : "bg-casino-700 border-transparent text-white/50 hover:text-white/80"
                  )}>
                  {BET_LABELS[t]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-white/40 text-xs font-medium uppercase tracking-wider">Amount</span>
            {betOptions.map((opt, i) => (
              <button key={i} onClick={() => setBetIdx(i)}
                className={cn("px-4 py-1.5 rounded-lg text-sm font-bold transition-all border",
                  betIdx === i ? "bg-gold-400/10 border-gold-400/40 text-gold-400" : "bg-casino-700 border-transparent text-white/40 hover:text-white/70"
                )}>
                {currency === "gold" ? opt.toLocaleString() : opt.toFixed(2)}
              </button>
            ))}
          </div>
          <Button variant="gold" size="lg" className="w-full" disabled={balance < bet} onClick={deal}>
            Deal · {betType.charAt(0).toUpperCase() + betType.slice(1)}
          </Button>
        </div>
      )}

      {phase === "result" && (
        <Button variant="gold" size="lg" className="w-full" onClick={reset}>New Hand</Button>
      )}
    </div>
  );
}

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
const RED_SUITS: Suit[] = ["♥", "♦"];
const RANK_VALUES: Record<Rank, number> = {
  "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8,
  "9": 9, "10": 10, "J": 11, "Q": 12, "K": 13, "A": 14,
};

type HandName =
  | "Royal Flush" | "Straight Flush" | "Four of a Kind"
  | "Full House" | "Flush" | "Straight"
  | "Three of a Kind" | "Two Pair" | "Jacks or Better" | "No Win";

const PAYOUTS: Record<HandName, number> = {
  "Royal Flush": 800,
  "Straight Flush": 50,
  "Four of a Kind": 25,
  "Full House": 9,
  "Flush": 6,
  "Straight": 4,
  "Three of a Kind": 3,
  "Two Pair": 2,
  "Jacks or Better": 1,
  "No Win": 0,
};

function buildDeck(): Card[] {
  return SUITS.flatMap((suit) => RANKS.map((rank) => ({ suit, rank })));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function evaluateHand(cards: Card[]): HandName {
  const vals = cards.map((c) => RANK_VALUES[c.rank]).sort((a, b) => a - b);
  const suits = cards.map((c) => c.suit);
  const isFlush = suits.every((s) => s === suits[0]);

  // Straight check (normal and wheel A-2-3-4-5)
  const isNormalStraight =
    new Set(vals).size === 5 && vals[4] - vals[0] === 4;
  const isWheel =
    JSON.stringify(vals) === JSON.stringify([2, 3, 4, 5, 14]);
  const isStraight = isNormalStraight || isWheel;

  // Frequency map
  const freq: Record<number, number> = {};
  vals.forEach((v) => (freq[v] = (freq[v] || 0) + 1));
  const counts = Object.values(freq).sort((a, b) => b - a);

  if (isFlush && isNormalStraight && vals[4] === 14) return "Royal Flush";
  if (isFlush && isStraight) return "Straight Flush";
  if (counts[0] === 4) return "Four of a Kind";
  if (counts[0] === 3 && counts[1] === 2) return "Full House";
  if (isFlush) return "Flush";
  if (isStraight) return "Straight";
  if (counts[0] === 3) return "Three of a Kind";
  if (counts[0] === 2 && counts[1] === 2) {
    return "Two Pair";
  }
  if (counts[0] === 2) {
    const pairVal = parseInt(
      Object.keys(freq).find((k) => freq[parseInt(k)] === 2) ?? "0"
    );
    if (pairVal >= 11 || pairVal === 14) return "Jacks or Better";
  }
  return "No Win";
}

type Phase = "deal" | "hold" | "result";

const BET_OPTIONS_GC = [100, 250, 500, 1000, 2500];
const BET_OPTIONS_SC = [0.1, 0.25, 0.5, 1, 2.5];

function PokerCard({ card, held, onToggle, phase }: {
  card: Card | null;
  held: boolean;
  onToggle: () => void;
  phase: Phase;
}) {
  const isRed = card ? RED_SUITS.includes(card.suit) : false;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        onClick={onToggle}
        disabled={phase !== "hold" || !card}
        className={cn(
          "playing-card w-[72px] h-[100px] rounded-xl border-2 transition-all focus:outline-none",
          card ? "bg-white" : "bg-casino-700 border-casino-500",
          held ? "held border-gold-400" : "border-gray-300",
          phase === "hold" && card ? "cursor-pointer hover:border-gold-400/50" : "cursor-default"
        )}
      >
        {card && (
          <div className={cn("p-1.5 h-full flex flex-col justify-between", isRed ? "text-red-600" : "text-gray-900")}>
            <div className="font-bold text-sm leading-none">{card.rank}</div>
            <div className="text-center text-2xl leading-none">{card.suit}</div>
            <div className="font-bold text-sm leading-none self-end rotate-180">{card.rank}</div>
          </div>
        )}
      </button>
      {phase === "hold" && card && (
        <span className={cn(
          "text-[10px] font-bold px-2 py-0.5 rounded",
          held ? "bg-gold-400 text-casino-900" : "text-white/30"
        )}>
          {held ? "HELD" : "HOLD?"}
        </span>
      )}
    </div>
  );
}

export function PokerTable() {
  const [deck, setDeck] = useState<Card[]>(() => shuffle(buildDeck()));
  const [hand, setHand] = useState<(Card | null)[]>([null, null, null, null, null]);
  const [held, setHeld] = useState([false, false, false, false, false]);
  const [phase, setPhase] = useState<Phase>("deal");
  const [handName, setHandName] = useState<HandName | null>(null);
  const [currency, setCurrency] = useState<Currency>("gold");
  const [betIndex, setBetIndex] = useState(2);
  const [sessionId, setSessionId] = useState("");
  const [lastPayout, setLastPayout] = useState<number | null>(null);

  const { goldCoins, sweepsCoins, deductBet, addWin } = useWalletStore();
  const betOptions = currency === "gold" ? BET_OPTIONS_GC : BET_OPTIONS_SC;
  const bet = betOptions[betIndex];
  const balance = currency === "gold" ? goldCoins : sweepsCoins;

  const deal = useCallback(async () => {
    if (balance < bet) return;
    deductBet(currency, bet);

    const { sessionId: sid, error } = await placeBet("poker", currency, bet);
    if (error) { addWin(currency, bet); return; }
    setSessionId(sid);

    const freshDeck = shuffle(buildDeck());
    const dealtHand = freshDeck.slice(0, 5) as Card[];
    setDeck(freshDeck.slice(5));
    setHand(dealtHand);
    setHeld([false, false, false, false, false]);
    setHandName(null);
    setLastPayout(null);
    setPhase("hold");
  }, [balance, bet, currency, deductBet, addWin]);

  const draw = useCallback(async () => {
    const currentDeck = [...deck];
    const newHand = hand.map((card, i) => {
      if (held[i] || !card) return card;
      const drawn = currentDeck.shift()!;
      return drawn;
    }) as Card[];

    setHand(newHand);
    setDeck(currentDeck);

    const name = evaluateHand(newHand);
    const multiplier = PAYOUTS[name];
    const payout = bet * multiplier;

    setHandName(name);
    setLastPayout(payout);
    setPhase("result");

    if (payout > 0) {
      addWin(currency, payout);
      await recordWin(sessionId, payout, { hand: newHand, handName: name });
    } else {
      await recordWin(sessionId, 0, { hand: newHand, handName: name });
    }
  }, [deck, hand, held, bet, currency, sessionId, addWin]);

  const toggleHold = (i: number) => {
    setHeld((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      {/* Currency & Bet */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4 bg-casino-800 rounded-xl p-4 border border-casino-600">
        <div className="flex gap-2">
          {(["gold", "sweeps"] as Currency[]).map((c) => (
            <button
              key={c}
              disabled={phase !== "deal"}
              onClick={() => setCurrency(c)}
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

      {/* Cards */}
      <div className="w-full felt rounded-2xl p-8 flex flex-col items-center gap-6 min-h-[280px]">
        <div className="flex gap-3 justify-center">
          {hand.map((card, i) => (
            <PokerCard
              key={i}
              card={card}
              held={held[i]}
              onToggle={() => toggleHold(i)}
              phase={phase}
            />
          ))}
        </div>

        {/* Hand name */}
        {handName && (
          <div className={cn(
            "text-2xl font-display font-bold tracking-wide",
            lastPayout && lastPayout > 0 ? "text-win animate-bounce-win" : "text-white/50"
          )}>
            {handName}
            {lastPayout && lastPayout > 0 && (
              <span className="ml-3 text-lg">
                +{currency === "gold" ? lastPayout.toLocaleString() : lastPayout.toFixed(2)}{" "}
                {currency === "gold" ? "GC" : "SC"}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="w-full bg-casino-800 rounded-xl border border-casino-600 p-4 space-y-3">
        {phase === "deal" && (
          <>
            <div className="flex items-center gap-2 justify-center flex-wrap">
              <span className="text-white/50 text-xs">Bet:</span>
              {betOptions.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setBetIndex(idx)}
                  className={cn(
                    "px-3 py-1 rounded text-xs font-medium transition-all",
                    betIndex === idx ? "bg-gold-400 text-casino-900" : "bg-casino-700 text-white/60 hover:text-white"
                  )}
                >
                  {currency === "gold" ? opt.toLocaleString() : opt.toFixed(2)}
                </button>
              ))}
            </div>
            <Button variant="gold" size="lg" onClick={deal} disabled={balance < bet} className="w-full">
              Deal ({currency === "gold" ? bet.toLocaleString() : bet.toFixed(2)} {currency === "gold" ? "GC" : "SC"})
            </Button>
          </>
        )}

        {phase === "hold" && (
          <div className="space-y-2">
            <p className="text-white/50 text-xs text-center">Click cards to HOLD them, then draw replacements</p>
            <Button variant="gold" size="lg" onClick={draw} className="w-full">
              Draw ({held.filter(Boolean).length} held)
            </Button>
          </div>
        )}

        {phase === "result" && (
          <Button variant="gold" size="lg" onClick={() => setPhase("deal")} className="w-full">
            Deal Again
          </Button>
        )}
      </div>

      {/* Paytable */}
      <div className="w-full bg-casino-800 rounded-xl border border-casino-600 p-4">
        <h3 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-3">Jacks or Better Paytable</h3>
        <div className="grid grid-cols-2 gap-1.5">
          {(Object.entries(PAYOUTS) as [HandName, number][])
            .filter(([, v]) => v > 0)
            .map(([name, mult]) => (
              <div
                key={name}
                className={cn(
                  "flex justify-between text-xs px-2 py-1 rounded",
                  handName === name ? "bg-win/20 text-win" : "text-white/60"
                )}
              >
                <span>{name}</span>
                <span className="font-mono text-gold-400">{mult}×</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

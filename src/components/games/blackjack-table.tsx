"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useWalletStore, type Currency } from "@/lib/store";
import { placeBet, recordWin } from "@/lib/actions/games";
import { Button } from "@/components/ui/button";

type Suit = "♠" | "♥" | "♦" | "♣";
type Rank = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
type Card = { suit: Suit; rank: Rank; hidden?: boolean };

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const RANKS: Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const RED_SUITS: Suit[] = ["♥", "♦"];

function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) for (const rank of RANKS) deck.push({ suit, rank });
  return deck;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function cardValue(card: Card): number {
  if (["J", "Q", "K"].includes(card.rank)) return 10;
  if (card.rank === "A") return 11;
  if (card.rank === "10") return 10;
  return parseInt(card.rank);
}

function handTotal(cards: Card[]): number {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    if (c.hidden) continue;
    total += cardValue(c);
    if (c.rank === "A") aces++;
  }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

function isBust(cards: Card[]): boolean { return handTotal(cards) > 21; }
function isBlackjack(cards: Card[]): boolean {
  return cards.length === 2 && handTotal(cards) === 21;
}

type Phase = "betting" | "player" | "dealer" | "done";

interface Result {
  outcome: "win" | "lose" | "push" | "blackjack";
  payout: number;
  message: string;
}

const BET_OPTIONS_GC = [100, 250, 500, 1000, 2500];
const BET_OPTIONS_SC = [0.1, 0.25, 0.5, 1, 2.5];

function PlayingCard({ card, small = false }: { card: Card; small?: boolean }) {
  const isRed = RED_SUITS.includes(card.suit);
  return (
    <div
      className={cn(
        "rounded-lg border select-none flex-shrink-0",
        small ? "w-10 h-14 text-xs" : "w-16 h-24 text-sm",
        card.hidden
          ? "bg-casino-600 border-casino-400 relative overflow-hidden"
          : "bg-white border-gray-200"
      )}
    >
      {card.hidden ? (
        <div className="absolute inset-1 rounded border border-white/10 bg-repeating-diamond" />
      ) : (
        <div className={cn("p-1 h-full flex flex-col justify-between", isRed ? "text-red-600" : "text-gray-900")}>
          <div className="font-bold leading-none">{card.rank}</div>
          <div className="text-center text-lg leading-none">{card.suit}</div>
          <div className="font-bold leading-none self-end rotate-180">{card.rank}</div>
        </div>
      )}
    </div>
  );
}

export function BlackjackTable() {
  const [deck, setDeck] = useState<Card[]>(() => shuffle(buildDeck().concat(buildDeck())));
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [phase, setPhase] = useState<Phase>("betting");
  const [currency, setCurrency] = useState<Currency>("gold");
  const [betIndex, setBetIndex] = useState(2);
  const [result, setResult] = useState<Result | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [doubledDown, setDoubledDown] = useState(false);

  const { goldCoins, sweepsCoins, deductBet, addWin } = useWalletStore();
  const betOptions = currency === "gold" ? BET_OPTIONS_GC : BET_OPTIONS_SC;
  const bet = betOptions[betIndex];
  const balance = currency === "gold" ? goldCoins : sweepsCoins;

  const drawCard = useCallback((currentDeck: Card[], hidden = false): [Card, Card[]] => {
    const [card, ...rest] = currentDeck;
    return [{ ...card, hidden }, rest];
  }, []);

  const reshuffle = useCallback((currentDeck: Card[]) => {
    if (currentDeck.length < 20) return shuffle(buildDeck().concat(buildDeck()));
    return currentDeck;
  }, []);

  const deal = useCallback(async () => {
    if (balance < bet) return;
    deductBet(currency, bet);

    const { sessionId: sid, error } = await placeBet("blackjack", currency, bet);
    if (error) { addWin(currency, bet); return; }
    setSessionId(sid);

    let currentDeck = reshuffle(deck);
    const [c1, d1] = drawCard(currentDeck); currentDeck = d1;
    const [c2, d2] = drawCard(currentDeck); currentDeck = d2;
    const [c3, d3] = drawCard(currentDeck); currentDeck = d3;
    const [c4, d4] = drawCard(currentDeck, true); currentDeck = d4;

    setPlayerHand([c1, c2]);
    setDealerHand([c3, c4]);
    setDeck(currentDeck);
    setResult(null);
    setDoubledDown(false);

    if (isBlackjack([c1, c2])) {
      // Reveal dealer hole card
      const revealed: Card[] = [c3, { ...c4, hidden: false }];
      setDealerHand(revealed);
      if (isBlackjack(revealed)) {
        setPhase("done");
        const res: Result = { outcome: "push", payout: bet, message: "Push — Both have Blackjack!" };
        setResult(res);
        addWin(currency, bet);
        await recordWin(sid, bet);
      } else {
        const payout = bet * 2.5;
        setPhase("done");
        const res: Result = { outcome: "blackjack", payout, message: "Blackjack! You win 3:2!" };
        setResult(res);
        addWin(currency, payout);
        await recordWin(sid, payout);
      }
    } else {
      setPhase("player");
    }
  }, [balance, bet, currency, deck, deductBet, addWin, drawCard, reshuffle]);

  const hit = useCallback(() => {
    if (phase !== "player") return;
    const [card, rest] = drawCard(deck);
    const newHand = [...playerHand, card];
    setPlayerHand(newHand);
    setDeck(rest);
    if (isBust(newHand)) {
      setPhase("done");
      const res: Result = { outcome: "lose", payout: 0, message: "Bust! You lose." };
      setResult(res);
      recordWin(sessionId, 0);
    }
  }, [phase, deck, playerHand, drawCard, sessionId]);

  const stand = useCallback(async () => {
    if (phase !== "player") return;
    setPhase("dealer");

    let dealerCards: Card[] = dealerHand.map((c) => ({ ...c, hidden: false }));
    let currentDeck = [...deck];

    while (handTotal(dealerCards) < 17) {
      const [card, rest] = drawCard(currentDeck);
      dealerCards = [...dealerCards, card];
      currentDeck = rest;
    }
    setDealerHand(dealerCards);
    setDeck(currentDeck);

    const pTotal = handTotal(playerHand);
    const dTotal = handTotal(dealerCards);
    let res: Result;

    if (isBust(dealerCards)) {
      res = { outcome: "win", payout: bet * 2, message: "Dealer busts! You win!" };
    } else if (pTotal > dTotal) {
      res = { outcome: "win", payout: bet * 2, message: "You win!" };
    } else if (pTotal < dTotal) {
      res = { outcome: "lose", payout: 0, message: "Dealer wins." };
    } else {
      res = { outcome: "push", payout: bet, message: "Push — it's a tie!" };
    }

    setResult(res);
    setPhase("done");
    if (res.payout > 0) addWin(currency, res.payout);
    await recordWin(sessionId, res.payout);
  }, [phase, dealerHand, deck, playerHand, bet, currency, sessionId, addWin, drawCard]);

  const doubleDown = useCallback(async () => {
    if (phase !== "player" || playerHand.length !== 2 || balance < bet) return;
    deductBet(currency, bet);
    setDoubledDown(true);

    const [card, rest] = drawCard(deck);
    const newHand = [...playerHand, card];
    setPlayerHand(newHand);
    setDeck(rest);

    if (isBust(newHand)) {
      setPhase("done");
      const res: Result = { outcome: "lose", payout: 0, message: "Bust after double down!" };
      setResult(res);
      await recordWin(sessionId, 0);
    } else {
      await stand();
    }
  }, [phase, playerHand, balance, bet, currency, deck, deductBet, drawCard, stand, sessionId]);

  const reset = () => {
    setPhase("betting");
    setPlayerHand([]);
    setDealerHand([]);
    setResult(null);
    setDoubledDown(false);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      {/* Controls */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4 bg-casino-800 rounded-xl p-4 border border-casino-600">
        <div className="flex gap-2">
          {(["gold", "sweeps"] as Currency[]).map((c) => (
            <button
              key={c}
              disabled={phase !== "betting"}
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
          Balance: {currency === "gold" ? `🪙 ${goldCoins.toLocaleString()}` : `💎 ${sweepsCoins.toFixed(2)}`}
        </div>
      </div>

      {/* Table */}
      <div className="w-full felt rounded-2xl border border-felt-600 p-6 space-y-6 min-h-[360px] relative">
        {/* Dealer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-white/50">
            <span>DEALER</span>
            <span>{phase !== "betting" && dealerHand.length > 0
              ? `${handTotal(dealerHand.filter(c => !c.hidden))}${dealerHand.some(c => c.hidden) ? "+" : ""}`
              : ""
            }</span>
          </div>
          <div className="flex gap-2 flex-wrap min-h-[96px] items-start">
            {dealerHand.map((card, i) => (
              <PlayingCard key={i} card={card} />
            ))}
          </div>
        </div>

        <div className="border-t border-white/10" />

        {/* Player */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-white/50">
            <span>YOU</span>
            <span>{playerHand.length > 0 ? handTotal(playerHand) : ""}</span>
          </div>
          <div className="flex gap-2 flex-wrap min-h-[96px] items-start">
            {playerHand.map((card, i) => (
              <PlayingCard key={i} card={card} />
            ))}
          </div>
        </div>

        {/* Result overlay */}
        {result && (
          <div className={cn(
            "absolute inset-0 flex items-center justify-center rounded-2xl",
            "bg-black/40 backdrop-blur-sm"
          )}>
            <div className="text-center space-y-2">
              <div className={cn(
                "text-3xl font-display font-bold",
                result.outcome === "win" || result.outcome === "blackjack" ? "text-win text-glow-gold" : "",
                result.outcome === "lose" ? "text-lose" : "",
                result.outcome === "push" ? "text-gold-400" : ""
              )}>
                {result.message}
              </div>
              {result.payout > 0 && (
                <div className="text-win text-lg">
                  +{currency === "gold" ? result.payout.toLocaleString() : result.payout.toFixed(2)}{" "}
                  {currency === "gold" ? "GC" : "SC"}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="w-full bg-casino-800 rounded-xl border border-casino-600 p-4">
        {phase === "betting" && (
          <div className="flex flex-col gap-3">
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
          </div>
        )}

        {phase === "player" && (
          <div className="flex gap-3">
            <Button variant="gold" size="lg" onClick={hit} className="flex-1">Hit</Button>
            <Button variant="outline" size="lg" onClick={stand} className="flex-1">Stand</Button>
            {playerHand.length === 2 && balance >= bet && (
              <Button variant="default" size="lg" onClick={doubleDown} className="flex-1">
                Double
              </Button>
            )}
          </div>
        )}

        {phase === "done" && (
          <Button variant="gold" size="lg" onClick={reset} className="w-full">
            New Hand
          </Button>
        )}

        {phase === "dealer" && (
          <div className="text-center text-white/50 text-sm py-2">Dealer playing...</div>
        )}
      </div>
    </div>
  );
}

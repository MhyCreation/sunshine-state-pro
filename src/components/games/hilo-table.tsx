"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useWalletStore, type Currency } from "@/lib/store";
import { placeBet, recordWin } from "@/lib/actions/games";
import { Button } from "@/components/ui/button";

type Suit = "♠" | "♥" | "♦" | "♣";
type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";
type Card = { suit: Suit; rank: Rank };

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const RANK_VALUE: Record<Rank, number> = { A: 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, J: 11, Q: 12, K: 13 };
const RED: Suit[] = ["♥", "♦"];
const BET_GC = [100, 250, 500, 1000, 2500];
const BET_SC = [0.1, 0.25, 0.5, 1, 2.5];
const HOUSE_EDGE = 0.97;

function buildDeck(): Card[] {
  return SUITS.flatMap(s => RANKS.map(r => ({ suit: s, rank: r })));
}
function shuffle(deck: Card[]): Card[] {
  const a = [...deck];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function pHigher(v: number): number { return Math.max(0.01, (13 - v) / 13); }
function pLower(v: number): number { return Math.max(0.01, (v - 1) / 13); }
function payoutFor(p: number): number { return Math.round((HOUSE_EDGE / p) * 100) / 100; }

function CardFace({ card }: { card: Card }) {
  const red = RED.includes(card.suit);
  return (
    <div className={cn("w-20 h-28 rounded-xl flex flex-col justify-between p-2 shadow-lg border text-sm font-bold",
      red ? "bg-white text-red-600 border-red-100" : "bg-white text-slate-900 border-slate-200")}>
      <span>{card.rank}</span>
      <span className="text-3xl text-center">{card.suit}</span>
      <span className="self-end rotate-180">{card.rank}</span>
    </div>
  );
}

export function HiLoTable() {
  const [currency, setCurrency] = useState<Currency>("gold");
  const [betIdx, setBetIdx] = useState(1);
  const [phase, setPhase] = useState<"idle" | "playing" | "won" | "lost">("idle");
  const [deck, setDeck] = useState<Card[]>(() => shuffle(buildDeck()));
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [nextCard, setNextCard] = useState<Card | null>(null);
  const [multiplier, setMultiplier] = useState(1.0);
  const [sessionId, setSessionId] = useState("");
  const [history, setHistory] = useState<Array<{ card: Card; guess: "higher" | "lower"; correct: boolean }>>([]);

  const { goldCoins, sweepsCoins, deductBet, addWin } = useWalletStore();
  const betOptions = currency === "gold" ? BET_GC : BET_SC;
  const bet = betOptions[betIdx];
  const balance = currency === "gold" ? goldCoins : sweepsCoins;

  const startGame = useCallback(async () => {
    if (phase !== "idle" || balance < bet) return;
    deductBet(currency, bet);
    const { sessionId: sid, error } = await placeBet("hilo", currency, bet);
    if (error) { addWin(currency, bet); return; }
    setSessionId(sid);
    const d = shuffle(buildDeck());
    const [first, ...rest] = d;
    setDeck(rest);
    setCurrentCard(first);
    setNextCard(null);
    setMultiplier(1.0);
    setHistory([]);
    setPhase("playing");
  }, [phase, balance, bet, currency, deductBet, addWin]);

  function guess(dir: "higher" | "lower") {
    if (phase !== "playing" || !currentCard) return;
    const [next, ...rest] = deck;
    setDeck(rest);
    setNextCard(next);

    const cv = RANK_VALUE[currentCard.rank];
    const nv = RANK_VALUE[next.rank];
    const correct = dir === "higher" ? nv > cv : nv < cv;

    if (!correct) {
      setHistory(h => [...h, { card: next, guess: dir, correct: false }]);
      setPhase("lost");
      recordWin(sessionId, 0, { history: history.length + 1, reason: "wrong_guess" });
      return;
    }

    const p = dir === "higher" ? pHigher(cv) : pLower(cv);
    const roundMult = payoutFor(p);
    const newMult = Math.round(multiplier * roundMult * 100) / 100;
    setMultiplier(newMult);
    setCurrentCard(next);
    setNextCard(null);
    setHistory(h => [...h, { card: next, guess: dir, correct: true }]);
  }

  function collect() {
    if (phase !== "playing" || !currentCard) return;
    const win = currency === "gold" ? Math.round(bet * multiplier) : Math.round(bet * multiplier * 100) / 100;
    addWin(currency, win);
    recordWin(sessionId, win, { multiplier, rounds: history.length });
    setPhase("won");
  }

  function reset() { setPhase("idle"); setCurrentCard(null); setNextCard(null); setMultiplier(1.0); setHistory([]); }

  const cv = currentCard ? RANK_VALUE[currentCard.rank] : 7;
  const ph = pHigher(cv);
  const pl = pLower(cv);
  const isPlaying = phase === "playing";

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

      {/* Card display */}
      <div className={cn("bg-casino-800 rounded-2xl border p-8 flex flex-col items-center gap-6 transition-all",
        phase === "won" ? "border-win/50" : phase === "lost" ? "border-red-500/50" : "border-casino-600")}>
        {/* Multiplier */}
        <div className="flex items-center gap-2">
          <span className="text-white/40 text-xs uppercase tracking-wider">Multiplier</span>
          <span className={cn("text-2xl font-black", multiplier > 1 ? "text-gold-400" : "text-white/40")}>{multiplier.toFixed(2)}×</span>
        </div>

        {/* Cards row */}
        <div className="flex items-center gap-6">
          {currentCard && <CardFace card={currentCard} />}
          {nextCard && (
            <>
              <span className="text-white/40 text-2xl">→</span>
              <CardFace card={nextCard} />
            </>
          )}
          {!currentCard && (
            <div className="w-20 h-28 rounded-xl border-2 border-dashed border-casino-500 flex items-center justify-center">
              <span className="text-white/20 text-3xl">?</span>
            </div>
          )}
        </div>

        {phase === "won" && <p className="text-win font-bold">🎉 Cashed out {multiplier.toFixed(2)}×</p>}
        {phase === "lost" && <p className="text-red-400 font-bold">Wrong guess — better luck next time!</p>}
      </div>

      {/* Action buttons */}
      <div className="bg-casino-800 rounded-2xl border border-casino-600 p-5 space-y-4">
        {phase === "idle" && (
          <>
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
            <Button variant="gold" size="lg" className="w-full" disabled={balance < bet} onClick={startGame}>Deal Card</Button>
          </>
        )}
        {isPlaying && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="gold" size="lg" onClick={() => guess("lower")} className="flex-col h-auto py-3">
                <span className="text-lg">⬇ Lower</span>
                <span className="text-xs opacity-60">{(pl * 100).toFixed(0)}% · {payoutFor(pl).toFixed(2)}×</span>
              </Button>
              <Button variant="gold" size="lg" onClick={() => guess("higher")} className="flex-col h-auto py-3">
                <span className="text-lg">⬆ Higher</span>
                <span className="text-xs opacity-60">{(ph * 100).toFixed(0)}% · {payoutFor(ph).toFixed(2)}×</span>
              </Button>
            </div>
            {history.length > 0 && (
              <Button variant="outline" size="lg" className="w-full" onClick={collect}>
                Collect {multiplier.toFixed(2)}× — {currency === "gold" ? Math.round(bet * multiplier).toLocaleString() : (bet * multiplier).toFixed(2)} {currency === "gold" ? "GC" : "SC"}
              </Button>
            )}
          </div>
        )}
        {(phase === "won" || phase === "lost") && (
          <Button variant="gold" size="lg" className="w-full" onClick={reset}>Play Again</Button>
        )}
      </div>
    </div>
  );
}

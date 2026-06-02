"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { useWalletStore } from "@/lib/store";
import { purchaseGoldCoins } from "@/lib/actions/wallet";
import { Button } from "@/components/ui/button";
import { CheckoutModal } from "@/components/casino/checkout-modal";
import { PURCHASE_PACKS, type PurchasePackId } from "@/lib/actions/payments";

// Base rate = 50,000 GC per SC (Starter pack).
// Each tier's value bar is shown relative to the best pack (100,000 GC/SC).
const BASE_RATE = 50_000; // GC per SC
const BEST_RATE = 100_000;

export interface Pack {
  id: string;
  name: string;
  emoji: string;
  scCost: number;
  gcBase: number;     // what the base rate would give
  gcBonus: number;    // extra on top
  gcTotal: number;    // gcBase + gcBonus
  badge?: { label: string; color: string };
  featured?: boolean;
}

export const PACKS: Pack[] = [
  {
    id: "starter",
    name: "Starter Bundle",
    emoji: "🪙",
    scCost: 0.10,
    gcBase:  5_000,
    gcBonus: 0,
    gcTotal: 5_000,
  },
  {
    id: "classic",
    name: "Classic Bundle",
    emoji: "💫",
    scCost: 0.25,
    gcBase: 12_500,
    gcBonus: 2_500,
    gcTotal: 15_000,
    badge: { label: "+2,500 BONUS", color: "bg-white/10 text-white/70" },
  },
  {
    id: "popular",
    name: "Popular Bundle",
    emoji: "⭐",
    scCost: 0.50,
    gcBase: 25_000,
    gcBonus: 10_000,
    gcTotal: 35_000,
    badge: { label: "POPULAR", color: "bg-blue-500/20 text-blue-300 border border-blue-500/30" },
  },
  {
    id: "premium",
    name: "Premium Bundle",
    emoji: "💎",
    scCost: 1.00,
    gcBase: 50_000,
    gcBonus: 30_000,
    gcTotal: 80_000,
    badge: { label: "BEST VALUE", color: "bg-gold-400/20 text-gold-400 border border-gold-400/30" },
    featured: true,
  },
  {
    id: "elite",
    name: "Elite Bundle",
    emoji: "🔥",
    scCost: 2.50,
    gcBase: 125_000,
    gcBonus: 100_000,
    gcTotal: 225_000,
    badge: { label: "+80K BONUS", color: "bg-orange-500/20 text-orange-300 border border-orange-500/30" },
  },
  {
    id: "jackpot",
    name: "Jackpot Bundle",
    emoji: "🌟",
    scCost: 5.00,
    gcBase: 250_000,
    gcBonus: 250_000,
    gcTotal: 500_000,
    badge: { label: "MEGA DEAL", color: "bg-win/20 text-win border border-win/30" },
  },
];

function ValueBar({ pack }: { pack: Pack }) {
  const rate = pack.gcTotal / pack.scCost;
  const pct = Math.round((rate / BEST_RATE) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-white/40">
        <span>Value</span>
        <span className="text-white/60 font-mono">{(rate / 1000).toFixed(0)}K GC/SC</span>
      </div>
      <div className="h-1.5 rounded-full bg-casino-600 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            pct >= 90 ? "bg-win" : pct >= 70 ? "bg-gold-400" : "bg-casino-400"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface PurchaseResult {
  packId: string;
  gcAwarded: number;
}

const REAL_MONEY_PACKS = [
  { id: "starter"  as PurchasePackId, emoji: "🌤",  badge: null,         featured: false },
  { id: "classic"  as PurchasePackId, emoji: "☀️",  badge: null,         featured: false },
  { id: "popular"  as PurchasePackId, emoji: "🌟",  badge: "POPULAR",    featured: false },
  { id: "premium"  as PurchasePackId, emoji: "💫",  badge: null,         featured: true  },
  { id: "elite"    as PurchasePackId, emoji: "🏆",  badge: "BEST VALUE", featured: false },
  { id: "jackpot"  as PurchasePackId, emoji: "💎",  badge: null,         featured: false },
];

export function CoinShop({ initialSweepsCoins }: { initialSweepsCoins: number }) {
  const [pending, startTransition] = useTransition();
  const [checkoutPack, setCheckoutPack] = useState<PurchasePackId | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<{ packId: PurchasePackId; gc: number } | null>(null);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [lastPurchase, setLastPurchase] = useState<PurchaseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { sweepsCoins, goldCoins, addWin, deductBet } = useWalletStore();

  // Use live store value if loaded, else fall back to server-rendered value
  const balance = sweepsCoins > 0 || initialSweepsCoins === 0 ? sweepsCoins : initialSweepsCoins;

  const purchase = (pack: Pack) => {
    if (balance < pack.scCost) return;
    setError(null);
    setLastPurchase(null);
    setPurchasingId(pack.id);

    startTransition(async () => {
      const result = await purchaseGoldCoins(pack.id);
      if (result.success && result.goldAwarded) {
        deductBet("sweeps", pack.scCost);
        addWin("gold", result.goldAwarded);
        setLastPurchase({ packId: pack.id, gcAwarded: result.goldAwarded });
      } else {
        setError(result.error ?? "Purchase failed");
      }
      setPurchasingId(null);
    });
  };

  return (
    <div className="space-y-10">

      {/* ── Real Money Purchase ─────────────────────────── */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-white">Buy Gold Coins</h2>
            <p className="text-white/40 text-xs mt-0.5">Instant delivery · Secure checkout · Every bundle includes free SC</p>
          </div>
          <div className="flex items-center gap-2 text-white/30">
            <span className="text-lg">💳</span>
            <span className="text-lg"></span>
            <span className="text-base font-bold tracking-tight">G Pay</span>
          </div>
        </div>

        {purchaseSuccess && (
          <div className="flex items-center gap-3 bg-win/10 border border-win/30 rounded-xl px-5 py-4">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="text-win font-semibold text-sm">+{purchaseSuccess.gc.toLocaleString()} Gold Coins added!</p>
              <p className="text-white/40 text-xs">
                {PURCHASE_PACKS[purchaseSuccess.packId].name} · +{PURCHASE_PACKS[purchaseSuccess.packId].scBonus.toFixed(2)} SC free bonus
              </p>
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REAL_MONEY_PACKS.map(({ id, emoji, badge, featured }) => {
            const pack = PURCHASE_PACKS[id];
            const usd = (pack.usdCents / 100).toFixed(2);
            return (
              <div
                key={id}
                className={cn(
                  "relative rounded-2xl border p-5 flex flex-col gap-4 transition-all card-shine cursor-pointer group",
                  featured
                    ? "bg-gradient-to-b from-casino-700 to-casino-800 border-gold-400/40 shadow-gold-glow"
                    : "bg-casino-800 border-casino-600 hover:border-casino-500"
                )}
              >
                {badge && (
                  <div className={cn(
                    "absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full",
                    featured ? "bg-gold-400/20 text-gold-400 border border-gold-400/30" : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  )}>
                    {badge}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center text-2xl", featured ? "bg-gold-400/20" : "bg-casino-700")}>
                    {emoji}
                  </div>
                  <div>
                    <p className={cn("font-semibold text-sm", featured ? "text-gold-400" : "text-white")}>{pack.name}</p>
                    <p className="text-white/30 text-xs">Instant delivery</p>
                  </div>
                </div>

                <div className="bg-casino-950/50 rounded-xl p-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">🪙 Gold Coins</span>
                    <span className="text-white font-bold font-mono">{pack.gcTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-win/70">💎 Free SC bonus</span>
                    <span className="text-win/80 font-mono">+{pack.scBonus.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setCheckoutPack(id)}
                  className={cn(
                    "w-full py-2.5 rounded-xl text-sm font-bold transition-all mt-auto",
                    featured
                      ? "bg-gradient-to-r from-gold-300 to-gold-500 text-casino-900 hover:brightness-110"
                      : "bg-casino-700 border border-casino-500 text-white hover:border-gold-400/40 group-hover:bg-casino-600"
                  )}
                >
                  Buy for ${usd}
                </button>
              </div>
            );
          })}
        </div>
        <p className="text-white/20 text-xs text-center">
          Payments secured by Stripe · Apple Pay & Google Pay accepted · No purchase necessary for Sweeps Coins
        </p>
      </section>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 border-t border-casino-700" />
        <p className="text-white/25 text-xs font-medium uppercase tracking-widest">or exchange SC → GC</p>
        <div className="flex-1 border-t border-casino-700" />
      </div>

      {/* ── SC → GC Exchange (existing) ─────────────────── */}
      <div className="space-y-8">
      {/* Balance header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-casino-800 rounded-2xl border border-casino-600 px-6 py-5">
        <div>
          <div className="text-white/40 text-xs mb-1">Your Sweeps Coins</div>
          <div className="text-3xl font-display font-bold text-win">
            💎 {balance.toFixed(2)} SC
          </div>
          <div className="text-white/30 text-xs mt-0.5">
            Gold Coins: 🪙 {goldCoins.toLocaleString()}
          </div>
        </div>
        <div className="text-right">
          <div className="text-white/40 text-xs">Exchange rate</div>
          <div className="text-white/60 text-sm mt-0.5">SC → GC</div>
          <div className="text-gold-400 text-xs mt-0.5">More SC spent = better rate</div>
        </div>
      </div>

      {/* Success banner */}
      {lastPurchase && (
        <div className="flex items-center gap-3 bg-win/10 border border-win/30 rounded-xl px-5 py-4 animate-fade-in">
          <span className="text-2xl">🎉</span>
          <div>
            <div className="text-win font-semibold">
              +{lastPurchase.gcAwarded.toLocaleString()} Gold Coins added!
            </div>
            <div className="text-white/40 text-xs">
              {PACKS.find((p) => p.id === lastPurchase.packId)?.name} purchased successfully
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-lose/10 border border-lose/30 rounded-xl px-5 py-3 text-lose text-sm">
          {error}
        </div>
      )}

      {/* Pack grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PACKS.map((pack) => {
          const canAfford = balance >= pack.scCost;
          const isBuying = purchasingId === pack.id && pending;
          const justBought = lastPurchase?.packId === pack.id;

          return (
            <div
              key={pack.id}
              className={cn(
                "relative rounded-2xl border p-5 flex flex-col gap-4 transition-all card-shine",
                pack.featured
                  ? "bg-gradient-to-b from-casino-700 to-casino-800 border-gold-400/40 shadow-gold-glow"
                  : "bg-casino-800 border-casino-600 hover:border-casino-400",
                !canAfford && "opacity-50",
                justBought && "border-win/50 shadow-[0_0_20px_rgba(34,197,94,0.2)]"
              )}
            >
              {/* Badge */}
              {pack.badge && (
                <div className={cn("absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full", pack.badge.color)}>
                  {pack.badge.label}
                </div>
              )}

              {/* Icon & Name */}
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0",
                  pack.featured ? "bg-gold-400/20" : "bg-casino-700"
                )}>
                  {pack.emoji}
                </div>
                <div className="min-w-0">
                  <div className={cn(
                    "font-display font-semibold text-base leading-tight",
                    pack.featured ? "text-gold-400" : "text-white"
                  )}>
                    {pack.name}
                  </div>
                  <div className="text-white/40 text-xs mt-0.5">
                    Instant delivery
                  </div>
                </div>
              </div>

              {/* GC breakdown */}
              <div className="bg-casino-950/60 rounded-xl p-3 space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-white/50 text-xs">Base GC</span>
                  <span className="text-white font-mono text-sm">{pack.gcBase.toLocaleString()}</span>
                </div>
                {pack.gcBonus > 0 && (
                  <div className="flex items-baseline justify-between">
                    <span className="text-win text-xs">+ Bonus GC</span>
                    <span className="text-win font-mono text-sm font-semibold">+{pack.gcBonus.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-casino-600 pt-1.5 flex items-baseline justify-between">
                  <span className="text-white/70 text-xs font-medium">Total 🪙</span>
                  <span className={cn(
                    "font-display font-bold text-lg",
                    pack.featured ? "text-gold-400" : "text-white"
                  )}>
                    {pack.gcTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Value bar */}
              <ValueBar pack={pack} />

              {/* CTA */}
              <Button
                variant={pack.featured ? "gold" : "outline"}
                size="lg"
                className="w-full mt-auto"
                disabled={!canAfford || pending}
                onClick={() => purchase(pack)}
              >
                {isBuying ? (
                  <span className="animate-pulse">Processing…</span>
                ) : justBought ? (
                  "✓ Purchased!"
                ) : !canAfford ? (
                  "Need more SC"
                ) : (
                  <>
                    <span className="text-sm">Spend</span>
                    <span className="font-bold">💎 {pack.scCost.toFixed(2)} SC</span>
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="text-white/20 text-xs text-center leading-relaxed">
        Sweeps Coins are earned free and have no monetary value until redeemed for prizes.
        Gold Coins obtained via this exchange are for entertainment only.
        No purchase necessary. Void where prohibited.
      </p>
      </div>{/* end SC→GC section */}

      {/* Checkout modal */}
      {checkoutPack && (
        <CheckoutModal
          pack={{ id: checkoutPack, ...PURCHASE_PACKS[checkoutPack] }}
          onClose={() => setCheckoutPack(null)}
          onSuccess={(gc) => {
            setPurchaseSuccess({ packId: checkoutPack, gc });
            setCheckoutPack(null);
          }}
        />
      )}
    </div>
  );
}

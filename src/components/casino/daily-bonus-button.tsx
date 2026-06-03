"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useWalletStore } from "@/lib/store";
import { claimDailyBonus } from "@/lib/actions/wallet";

export function DailyBonusButton({ alreadyClaimed }: { alreadyClaimed: boolean }) {
  const [claimed, setClaimed] = useState(alreadyClaimed);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { addWin } = useWalletStore();

  const claim = () => {
    startTransition(async () => {
      const result = await claimDailyBonus();
      if (result.success) {
        setClaimed(true);
        addWin("gold", result.gold ?? 0);
        addWin("sweeps", result.sweeps ?? 0);
        setMessage(`+${(result.gold ?? 0).toLocaleString()} GC & +${(result.sweeps ?? 0).toFixed(2)} SC!`);
      } else {
        setMessage(result.error ?? null);
      }
    });
  };

  if (claimed) {
    return (
      <div className="text-center">
        <div className="text-xs text-white/40">Daily bonus</div>
        <div className="text-xs text-win font-medium">{message ?? "Claimed ✓"}</div>
      </div>
    );
  }

  return (
    <div className="text-center space-y-1">
      <Button variant="gold" size="sm" onClick={claim} disabled={pending} className="animate-pulse-gold">
        {pending ? "Claiming…" : "🎁 Daily Bonus"}
      </Button>
      <div className="text-[10px] text-white/30">1,000 GC + 0.50 SC free</div>
    </div>
  );
}

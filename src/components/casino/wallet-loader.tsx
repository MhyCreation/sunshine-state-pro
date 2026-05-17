"use client";

import { useEffect } from "react";
import { useWalletStore } from "@/lib/store";

export function WalletLoader({ goldCoins, sweepsCoins }: { goldCoins: number; sweepsCoins: number }) {
  const setWallet = useWalletStore((s) => s.setWallet);
  useEffect(() => {
    setWallet(goldCoins, sweepsCoins);
  }, [goldCoins, sweepsCoins, setWallet]);
  return null;
}

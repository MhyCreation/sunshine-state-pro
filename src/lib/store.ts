import { create } from "zustand";

export type Currency = "gold" | "sweeps";

interface WalletState {
  goldCoins: number;
  sweepsCoins: number;
  loaded: boolean;
  setWallet: (gold: number, sweeps: number) => void;
  deductBet: (currency: Currency, amount: number) => void;
  addWin: (currency: Currency, amount: number) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  goldCoins: 0,
  sweepsCoins: 0,
  loaded: false,
  setWallet: (gold, sweeps) => set({ goldCoins: gold, sweepsCoins: sweeps, loaded: true }),
  deductBet: (currency, amount) =>
    set((state) =>
      currency === "gold"
        ? { goldCoins: Math.max(0, state.goldCoins - amount) }
        : { sweepsCoins: parseFloat(Math.max(0, state.sweepsCoins - amount).toFixed(2)) }
    ),
  addWin: (currency, amount) =>
    set((state) =>
      currency === "gold"
        ? { goldCoins: state.goldCoins + amount }
        : { sweepsCoins: parseFloat((state.sweepsCoins + amount).toFixed(2)) }
    ),
}));

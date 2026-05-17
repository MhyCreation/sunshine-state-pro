"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid, Spade, Diamond, Club, Heart,
  Wallet, LogOut, User, Trophy, ShoppingBag,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { logoutAction } from "@/lib/actions/auth";
import { useWalletStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", icon: LayoutGrid, label: "Lobby" },
  { href: "/games/slots", icon: Spade, label: "Slots" },
  { href: "/games/blackjack", icon: Diamond, label: "Blackjack" },
  { href: "/games/poker", icon: Club, label: "Poker" },
  { href: "/games/roulette", icon: Heart, label: "Roulette" },
  { href: "/wallet", icon: Wallet, label: "Wallet" },
  { href: "/shop", icon: ShoppingBag, label: "Coin Shop" },
];

export function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const { goldCoins, sweepsCoins } = useWalletStore();

  return (
    <aside className="w-60 shrink-0 bg-casino-800 border-r border-casino-600 flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-casino-600">
        <Logo />
      </div>

      {/* Wallet summary */}
      <div className="mx-3 mt-3 rounded-lg bg-casino-700 border border-casino-500 p-3 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/50">Gold Coins</span>
          <span className="text-gold-400 font-semibold">🪙 {goldCoins.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/50">Sweeps Coins</span>
          <span className="text-win font-semibold">💎 {sweepsCoins.toFixed(2)}</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <div className="px-3 mb-2 text-[10px] uppercase tracking-wider text-white/30">Games</div>
        {nav.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all",
                active
                  ? "bg-gold-400/15 text-gold-400 font-medium"
                  : "text-white/60 hover:text-white hover:bg-casino-700"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-casino-600 space-y-1">
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-casino-700"
        >
          <Trophy className="h-4 w-4" />
          Achievements
        </Link>
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-casino-700"
        >
          <User className="h-4 w-4" />
          Profile
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-casino-700"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
        <div className="mt-3 px-3 py-2 flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-gradient-gold flex items-center justify-center text-casino-900 text-xs font-bold shrink-0">
            {userName.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div className="text-xs overflow-hidden">
            <div className="font-medium text-white truncate">{userName}</div>
            <div className="text-white/40">Player</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

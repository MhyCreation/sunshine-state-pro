import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/casino/sidebar";
import { WalletLoader } from "@/components/casino/wallet-loader";

export default async function CasinoLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: wallet } = await supabase
    .from("wallets")
    .select("gold_coins, sweeps_coins")
    .eq("user_id", user.id)
    .single();

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  const displayName =
    profile?.username ??
    user.user_metadata?.username ??
    user.email?.split("@")[0] ??
    "Player";

  return (
    <div className="flex min-h-screen bg-casino-900">
      <WalletLoader
        goldCoins={wallet?.gold_coins ?? 10000}
        sweepsCoins={parseFloat(String(wallet?.sweeps_coins ?? "2.00"))}
      />
      <Sidebar userName={displayName} />
      <main className="flex-1 p-6 md:p-8 overflow-auto">{children}</main>
    </div>
  );
}

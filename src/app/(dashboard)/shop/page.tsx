import { createClient } from "@/lib/supabase/server";
import { CoinShop } from "@/components/casino/coin-shop";

export default async function ShopPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: wallet } = await supabase
    .from("wallets")
    .select("sweeps_coins")
    .eq("user_id", user!.id)
    .single();

  const sweepsCoins = parseFloat(String(wallet?.sweeps_coins ?? "0"));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">🪙 Gold Coin Shop</h1>
        <p className="text-white/50 text-sm mt-1">
          Exchange your Sweeps Coins for Gold Coins — bigger packs give better rates
        </p>
      </div>

      <CoinShop initialSweepsCoins={sweepsCoins} />
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { getRecentTransactions, getRedemptionEligibility } from "@/lib/actions/wallet";
import { RedemptionForm } from "@/components/casino/redemption-form";

function formatAmount(amount: number, currency: string) {
  if (currency === "gold") return `🪙 ${amount > 0 ? "+" : ""}${Math.round(amount).toLocaleString()} GC`;
  return `💎 ${amount > 0 ? "+" : ""}${Number(amount).toFixed(2)} SC`;
}

export default async function WalletPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: wallet } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", user!.id)
    .single();

  const transactions = await getRecentTransactions(30);
  const { hasPlayedWithSC } = await getRedemptionEligibility();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">💼 Wallet</h1>
        <p className="text-white/50 text-sm mt-1">Your balances and transaction history</p>
      </div>

      {/* Balances */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-casino-800 rounded-2xl border border-gold-400/20 p-6 card-shine">
          <div className="text-4xl mb-3">🪙</div>
          <div className="text-3xl font-display font-bold text-gold-400">
            {(wallet?.gold_coins ?? 0).toLocaleString()}
          </div>
          <div className="text-white/50 text-sm mt-1">Gold Coins</div>
          <div className="mt-4 text-xs text-white/30">
            Fun play only · No cash value
          </div>
        </div>
        <div className="bg-casino-800 rounded-2xl border border-win/20 p-6 card-shine">
          <div className="text-4xl mb-3">💎</div>
          <div className="text-3xl font-display font-bold text-win">
            {parseFloat(String(wallet?.sweeps_coins ?? "0")).toFixed(2)}
          </div>
          <div className="text-white/50 text-sm mt-1">Sweeps Coins</div>
          <div className="mt-4 text-xs text-white/30">
            Redeemable for prizes
          </div>
        </div>
      </div>

      {/* Lifetime stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-casino-800 rounded-xl border border-casino-600 p-4">
          <div className="text-white/40 text-xs mb-1">Lifetime GC Won</div>
          <div className="text-white font-mono font-semibold">
            🪙 {(wallet?.lifetime_gc_won ?? 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-casino-800 rounded-xl border border-casino-600 p-4">
          <div className="text-white/40 text-xs mb-1">Lifetime SC Won</div>
          <div className="text-white font-mono font-semibold">
            💎 {parseFloat(String(wallet?.lifetime_sc_won ?? "0")).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Redemption */}
      <RedemptionForm sweepsCoins={parseFloat(String(wallet?.sweeps_coins ?? "0"))} hasPlayedWithSC={hasPlayedWithSC} />

      {/* Sweepstakes notice */}
      <div className="bg-casino-800 rounded-xl border border-casino-600 p-4">
        <h3 className="text-white font-medium text-sm mb-2">About Sweeps Coins</h3>
        <p className="text-white/40 text-xs leading-relaxed">
          Sweeps Coins (SC) are awarded free of charge through daily bonuses and gameplay.
          They can be redeemed for gift cards and prizes. No purchase necessary.
          Sweeps Coins have no cash value until redeemed. Minimum 100 SC required for redemption.
          Void where prohibited by law. Must be 18+.
        </p>
      </div>

      {/* Transaction history */}
      <div>
        <h2 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-4">Transaction History</h2>
        {transactions.length === 0 ? (
          <div className="bg-casino-800 rounded-xl border border-casino-600 p-8 text-center text-white/30 text-sm">
            No transactions yet — start playing to see your history!
          </div>
        ) : (
          <div className="bg-casino-800 rounded-xl border border-casino-600 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-casino-600">
                  <th className="text-left text-white/40 text-xs font-medium px-4 py-3">Type</th>
                  <th className="text-left text-white/40 text-xs font-medium px-4 py-3">Description</th>
                  <th className="text-right text-white/40 text-xs font-medium px-4 py-3">Amount</th>
                  <th className="text-right text-white/40 text-xs font-medium px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const amount = parseFloat(String(tx.amount));
                  return (
                    <tr key={tx.id} className="border-b border-casino-700 last:border-0">
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                          tx.type === "win" ? "bg-win/20 text-win" :
                          tx.type === "bet" ? "bg-lose/20 text-lose" :
                          "bg-gold-400/20 text-gold-400"
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/60 text-xs">{tx.description ?? tx.game ?? "—"}</td>
                      <td className={`px-4 py-3 text-right font-mono text-xs font-medium ${
                        amount > 0 ? "text-win" : amount < 0 ? "text-lose" : "text-white/40"
                      }`}>
                        {formatAmount(amount, tx.currency)}
                      </td>
                      <td className="px-4 py-3 text-right text-white/30 text-xs">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

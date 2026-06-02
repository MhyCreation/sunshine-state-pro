"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { createPaymentIntent, confirmGoldCoinPurchase, type PurchasePackId } from "@/lib/actions/payments";
import { useWalletStore } from "@/lib/store";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

const STRIPE_APPEARANCE = {
  theme: "night" as const,
  variables: {
    colorPrimary: "#f5c842",
    colorBackground: "#141b2d",
    colorText: "#ffffff",
    colorDanger: "#ef4444",
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    borderRadius: "10px",
  },
  rules: {
    ".Input": { border: "1px solid rgba(255,255,255,0.12)", backgroundColor: "#0d1321" },
    ".Input:focus": { border: "1px solid rgba(245,200,66,0.5)", boxShadow: "0 0 0 3px rgba(245,200,66,0.1)" },
    ".Label": { color: "rgba(255,255,255,0.5)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" },
    ".Tab": { border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "#0d1321" },
    ".Tab--selected": { border: "1px solid rgba(245,200,66,0.4)", backgroundColor: "rgba(245,200,66,0.08)" },
    ".Tab:hover": { border: "1px solid rgba(245,200,66,0.3)" },
  },
};

interface Pack {
  id: PurchasePackId;
  name: string;
  usdCents: number;
  gcTotal: number;
  scBonus: number;
}

function CheckoutForm({ pack, onSuccess, onClose }: { pack: Pack; onSuccess: (gc: number) => void; onClose: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addWin } = useWalletStore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) { setError(submitError.message ?? "Payment failed"); setLoading(false); return; }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed");
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      const result = await confirmGoldCoinPurchase(pack.id, paymentIntent.id);
      if (result.success && result.gcAwarded) {
        addWin("gold", result.gcAwarded);
        addWin("sweeps", pack.scBonus);
        onSuccess(result.gcAwarded);
      } else {
        setError(result.error ?? "Purchase confirmation failed");
      }
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-casino-950/60 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-white font-semibold">{pack.name}</p>
          <p className="text-gold-400 text-sm mt-0.5">🪙 {pack.gcTotal.toLocaleString()} GC + 💎 {pack.scBonus.toFixed(2)} SC free</p>
        </div>
        <p className="text-white text-xl font-bold">${(pack.usdCents / 100).toFixed(2)}</p>
      </div>

      <PaymentElement options={{ layout: "tabs" }} />

      {error && (
        <p className="text-xs text-lose bg-lose/10 border border-lose/30 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-3 rounded-xl font-bold text-casino-900 text-base transition-all
          bg-gradient-to-r from-gold-300 to-gold-500
          disabled:opacity-50 disabled:cursor-not-allowed
          enabled:hover:brightness-110 enabled:active:scale-[0.98]"
      >
        {loading ? "Processing…" : `Pay $${(pack.usdCents / 100).toFixed(2)}`}
      </button>

      <p className="text-center text-xs text-white/25 leading-relaxed">
        Secured by Stripe · No purchase necessary for Sweeps Coins<br />
        Gold Coins are for entertainment only · 18+ only
      </p>
    </form>
  );
}

interface CheckoutModalProps {
  pack: Pack;
  onClose: () => void;
  onSuccess: (gc: number) => void;
}

export function CheckoutModal({ pack, onClose, onSuccess }: CheckoutModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [successGc, setSuccessGc] = useState<number | null>(null);

  useEffect(() => {
    createPaymentIntent(pack.id).then(({ clientSecret, error }) => {
      if (error) setLoadError(error);
      else setClientSecret(clientSecret);
    });
  }, [pack.id]);

  function handleSuccess(gc: number) {
    setSuccessGc(gc);
    setTimeout(() => { onSuccess(gc); onClose(); }, 2500);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-casino-800 rounded-2xl border border-casino-600 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-casino-700">
          <h2 className="font-display text-lg font-bold text-white">Complete Purchase</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors text-xl leading-none">✕</button>
        </div>

        <div className="p-5">
          {successGc !== null ? (
            <div className="text-center py-8 space-y-3">
              <div className="text-5xl">🎉</div>
              <p className="text-win text-lg font-bold">Payment Successful!</p>
              <p className="text-white/60 text-sm">+{successGc.toLocaleString()} Gold Coins added to your wallet</p>
              <p className="text-white/30 text-xs">+{pack.scBonus.toFixed(2)} SC free bonus included</p>
            </div>
          ) : loadError ? (
            <div className="text-center py-8 space-y-3">
              <div className="text-4xl">⚠️</div>
              <p className="text-lose text-sm">{loadError}</p>
              {loadError === "Payments not configured" && (
                <p className="text-white/30 text-xs">Add your Stripe keys to .env.local to enable payments.</p>
              )}
            </div>
          ) : !clientSecret ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 rounded-full border-2 border-gold-400/30 border-t-gold-400 animate-spin" />
            </div>
          ) : stripePromise ? (
            <Elements
              stripe={stripePromise}
              options={{ clientSecret, appearance: STRIPE_APPEARANCE }}
            >
              <CheckoutForm pack={pack} onSuccess={handleSuccess} onClose={onClose} />
            </Elements>
          ) : (
            <p className="text-center text-lose text-sm py-8">Stripe publishable key not configured.</p>
          )}
        </div>
      </div>
    </div>
  );
}

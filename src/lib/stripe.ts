import Stripe from "stripe";

let _stripe: Stripe | undefined;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-02-24.acacia",
    });
  }
  return _stripe;
}

export const PLANS = {
  free: {
    name: "Free",
    priceId: null as null,
    price: 0,
    features: [
      "Up to 10 customers",
      "20 jobs per month",
      "1 team member",
      "Basic scheduling",
    ],
  },
  pro: {
    name: "Pro",
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? "",
    price: 29,
    features: [
      "Unlimited customers",
      "Unlimited jobs",
      "3 team members",
      "Invoice generation",
      "Route optimization",
      "Priority support",
    ],
  },
} as const;

export type Plan = keyof typeof PLANS;

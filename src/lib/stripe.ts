import { loadStripe, type Stripe } from "@stripe/stripe-js";

/**
 * loadStripe() must only be called once per publishable key - calling it inside a component body
 * would re-fetch Stripe.js on every render. Memoized at module scope, shared across every mount of
 * the checkout form. Resolves to null (and StripeCheckoutDialog reports a clear error instead of
 * silently doing nothing) when NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY isn't set yet.
 */
let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    stripePromise = publishableKey ? loadStripe(publishableKey) : Promise.resolve(null);
  }
  return stripePromise;
}

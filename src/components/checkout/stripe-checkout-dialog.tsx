"use client";

import { useEffect, useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { AlertTriangle, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getStripe } from "@/lib/stripe";

/** How long to wait for Stripe.js/Elements to become ready before showing a visible error instead
 *  of leaving the payer staring at a silently-disabled button (see StripeCheckoutForm). */
const READY_TIMEOUT_MS = 8000;

interface StripeCheckoutDialogProps {
  clientSecret: string;
  /** Where Stripe sends the payer back if the chosen method requires a full page redirect (some
   *  bank wallets/redirect-based methods) - card, and Apple/Google Pay in most cases, resolve
   *  inline instead thanks to redirect: "if_required" below. */
  returnUrl: string;
  onConfirmed: () => void;
  onCancel: () => void;
}

/**
 * Mounts Stripe's Payment Element for the PaymentIntent the backend already created (see
 * StripePaymentGateway) and confirms it directly with Stripe - the card/wallet details never
 * reach this app's backend. Final confirmation of the booking still comes from the
 * payment_intent.succeeded webhook (see StripeWebhookController); this dialog only reports that
 * the payer's part is done, not that the booking is already fully confirmed.
 */
export function StripeCheckoutDialog({ clientSecret, returnUrl, onConfirmed, onCancel }: StripeCheckoutDialogProps) {
  return (
      <Dialog open onOpenChange={(open) => !open && onCancel()}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <ShieldCheck className="size-4 text-primary" />
              Paiement sécurisé
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              Tes informations de paiement sont saisies directement chez Stripe - jamais transmises à nos serveurs.
            </DialogDescription>
          </DialogHeader>

          <Elements stripe={getStripe()} options={{ clientSecret }}>
            <StripeCheckoutForm returnUrl={returnUrl} onConfirmed={onConfirmed} onCancel={onCancel} />
          </Elements>
        </DialogContent>
      </Dialog>
  );
}

function StripeCheckoutForm({
                               returnUrl,
                               onConfirmed,
                               onCancel,
                             }: Pick<StripeCheckoutDialogProps, "returnUrl" | "onConfirmed" | "onCancel">) {
  const stripe = useStripe();
  const elements = useElements();
  const [isConfirming, setIsConfirming] = useState(false);
  const [readyTimedOut, setReadyTimedOut] = useState(false);
  // useStripe()/useElements() go non-null as soon as the Elements *context* exists, well before
  // the PaymentElement iframe has actually finished mounting - confirmPayment() before that point
  // fails with "elements should have a mounted Payment Element". onReady is the only signal that
  // the element is truly ready to be confirmed.
  const [elementReady, setElementReady] = useState(false);

  // stripe/elements silently stay null forever if Stripe.js failed to load (blocked by CSP,
  // NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY unset/invalid, network issue...) - the button just being
  // disabled with no explanation is exactly the dead end a real payer hit here, so surface it.
  useEffect(() => {
    if (stripe && elements && elementReady) {
      setReadyTimedOut(false);
      return;
    }
    const timer = setTimeout(() => setReadyTimedOut(true), READY_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [stripe, elements, elementReady]);

  async function handleConfirm() {
    if (!stripe || !elements || !elementReady) {
      // Stripe.js is still loading, or NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY isn't set (getStripe()
      // then resolves to null) - either way there is nothing to confirm with yet.
      toast.error("Le module de paiement Stripe n'est pas encore prêt, réessaie dans un instant.");
      return;
    }

    setIsConfirming(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
      redirect: "if_required",
    });
    setIsConfirming(false);

    if (error) {
      // card_error/validation_error are shown inline by the Payment Element itself; only surface
      // a toast for the rest (network/API errors) so the payer doesn't see the message twice.
      if (error.type !== "card_error" && error.type !== "validation_error") {
        toast.error(error.message ?? "Le paiement a échoué, veuillez réessayer.");
      }
      return;
    }

    onConfirmed();
  }

  return (
      <div className="space-y-4">
        {readyTimedOut && (
            <Alert variant="destructive" className="rounded-xl border-destructive/25 bg-destructive/[0.03]">
              <AlertTriangle className="size-4" />
              <AlertDescription className="text-xs font-medium text-destructive">
                Le module de paiement Stripe n&apos;a pas pu se charger. Vérifie ta connexion et
                réessaie, ou contacte-nous si le problème persiste.
              </AlertDescription>
            </Alert>
        )}

        <PaymentElement
            onReady={() => setElementReady(true)}
            onLoadError={(event) => {
              // Surfaces the real Stripe-side reason (e.g. no payment method enabled for this
              // account/currency) instead of leaving the payer stuck on a disabled button until
              // the generic 8s timeout fires.
              console.error("Payment Element failed to load", event.error);
              toast.error(event.error.message ?? "Le module de paiement Stripe n'a pas pu se charger.");
            }}
        />

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
              type="button"
              variant="ghost"
              className="rounded-xl font-semibold"
              onClick={onCancel}
              disabled={isConfirming}
          >
            Annuler
          </Button>
          <Button
              type="button"
              className="rounded-xl font-bold gap-1.5"
              onClick={handleConfirm}
              disabled={!stripe || !elements || !elementReady || isConfirming}
          >
            {isConfirming && <Loader2 className="size-3.5 animate-spin" />}
            Payer
          </Button>
        </DialogFooter>
      </div>
  );
}

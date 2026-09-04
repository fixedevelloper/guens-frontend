"use client";

import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { ShieldCheck } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getStripe } from "@/lib/stripe";

interface StripeCheckoutDialogProps {
  clientSecret: string;
  onConfirmed: () => void;
  onCancel: () => void;
}

/**
 * Mounts Stripe's Embedded Checkout for the Checkout Session the backend already created (see
 * StripePaymentGateway) - it renders Stripe's own full payment UI (card/wallet fields, PayPal,
 * error states, loading states) inside this dialog, so there is no manual confirmPayment/element
 * readiness wiring to maintain here. Final confirmation of the booking still comes from the
 * checkout.session.completed webhook (see StripeWebhookController); onComplete only reports that
 * the payer's part is done, not that the booking is already fully confirmed.
 */
export function StripeCheckoutDialog({ clientSecret, onConfirmed, onCancel }: StripeCheckoutDialogProps) {
  return (
      <Dialog open onOpenChange={(open) => !open && onCancel()}>
        <DialogContent className="sm:max-w-lg rounded-2xl p-0 overflow-hidden gap-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <ShieldCheck className="size-4 text-primary" />
              Paiement sécurisé
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              Tes informations de paiement sont saisies directement chez Stripe - jamais transmises à nos serveurs.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[70vh] overflow-y-auto">
            <EmbeddedCheckoutProvider
                stripe={getStripe()}
                options={{ clientSecret, onComplete: onConfirmed }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        </DialogContent>
      </Dialog>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, XCircle } from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getPayment } from "@/lib/api/payment";

/**
 * Landing page Flutterwave sends the payer back to once they've completed a 3DS/bank-page
 * authorization challenge (see FlutterwaveProperties.redirectUrl - "tx_ref" is our payment id, not
 * the booking id). The actual charge confirmation still arrives via webhook independently of this
 * page; this just gets the payer back to a page that reflects the live booking status instead of
 * leaving them stranded on Flutterwave's domain.
 */
export default function PaymentRedirectPage() {
  return (
      <Suspense fallback={<RedirectingState />}>
        <PaymentRedirectContent />
      </Suspense>
  );
}

function PaymentRedirectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get("tx_ref");
  const [lookupFailed, setLookupFailed] = useState(false);

  useEffect(() => {
    if (!paymentId) {
      return;
    }
    getPayment(paymentId)
        .then((payment) => router.replace(`/bookings/${payment.bookingId}`))
        .catch(() => setLookupFailed(true));
  }, [paymentId, router]);

  if (!paymentId || lookupFailed) {
    return (
        <div className="mx-auto max-w-xl px-4 py-16 text-center">
          <Alert variant="destructive" className="rounded-2xl border-destructive/25 bg-destructive/[0.03]">
            <XCircle className="size-5" />
            <AlertDescription className="font-medium text-destructive">
              Impossible de retrouver votre réservation. Consultez vos réservations depuis votre tableau de bord.
            </AlertDescription>
          </Alert>
        </div>
    );
  }

  return <RedirectingState />;
}

function RedirectingState() {
  return (
      <div className="mx-auto max-w-xl px-4 py-24 flex flex-col items-center gap-3 text-center">
        <Loader2 className="size-6 animate-spin text-primary" />
        <p className="text-sm font-semibold text-muted-foreground">
          Finalisation de votre paiement...
        </p>
      </div>
  );
}

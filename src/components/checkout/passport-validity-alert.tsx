"use client";

import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  checkPassportValidity,
  DEFAULT_MIN_PASSPORT_VALIDITY_MONTHS,
} from "@/lib/passport-validity";

interface PassportValidityAlertProps {
  /** `YYYY-MM-DD`, matching this app's date `<input>` fields. Renders nothing when empty -
   *  passport is an optional field on routes that don't require one (see checkout-form.tsx). */
  passportExpiryDate?: string;
  /** `YYYY-MM-DD` - the flight's departure date the passport is checked against. */
  flightDate: string;
  minValidityMonths?: number;
  className?: string;
}

/** Surfaces the same "N months after travel" passport rule as {@link checkPassportValidity} in
 *  the traveler form, ahead of checkout - the alternative (finding out from a provider rejection
 *  after payment capture, see checkout-form.tsx) is a much worse place to learn this. */
export function PassportValidityAlert({
  passportExpiryDate,
  flightDate,
  minValidityMonths = DEFAULT_MIN_PASSPORT_VALIDITY_MONTHS,
  className,
}: PassportValidityAlertProps) {
  if (!passportExpiryDate) {
    return null;
  }

  const result = checkPassportValidity(passportExpiryDate, flightDate, minValidityMonths);

  if (result.status === "valid") {
    return (
      <Alert variant="success" className={className}>
        <CheckCircle2 />
        <AlertTitle>Passeport valide</AlertTitle>
        <AlertDescription>
          Ce passeport couvre les {minValidityMonths} mois requis après la date du voyage.
        </AlertDescription>
      </Alert>
    );
  }

  if (result.status === "expired") {
    return (
      <Alert variant="destructive" className={className}>
        <XCircle />
        <AlertTitle>Passeport expiré</AlertTitle>
        <AlertDescription>
          Ce passeport sera expiré à la date du voyage ({flightDate}). Il doit être renouvelé avant
          de réserver.
        </AlertDescription>
      </Alert>
    );
  }

  const requiredBy = result.requiredExpiryDate.toISOString().slice(0, 10);
  return (
    <Alert variant="warning" className={className}>
      <AlertTriangle />
      <AlertTitle>Validité insuffisante</AlertTitle>
      <AlertDescription>
        Ce passeport doit rester valide au moins {minValidityMonths} mois après la date du voyage
        (jusqu&apos;au {requiredBy} au minimum) - il ne lui reste que {result.monthsRemaining} mois.
      </AlertDescription>
    </Alert>
  );
}

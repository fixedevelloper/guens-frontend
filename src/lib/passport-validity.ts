import { z } from "zod";

/** Most countries require a passport to remain valid for a minimum number of months *after* the
 *  travel date, not merely not-yet-expired on that date - the existing check in checkout-form.tsx
 *  (`passportExpiryDate >= travelDate`) only catches the latter, which is why a real Travel
 *  Terminus rejection ("Passport for passenger1 will be expired before travel date") only
 *  surfaced after payment capture. 6 months is the most common threshold (Schengen, UK, many
 *  others); some destinations require less, none commonly require more, so it's a safe default -
 *  callers with a specific destination's real rule can override via `minValidityMonths`. */
export const DEFAULT_MIN_PASSPORT_VALIDITY_MONTHS = 6;

export type PassportValidityStatus = "valid" | "expiring-soon" | "expired";

export interface PassportValidityResult {
  /** `true` only when the passport comfortably clears the minimum-validity rule. */
  valid: boolean;
  /** `"expired"` when the passport is already expired as of the flight date (a stricter,
   *  more urgent problem than merely not covering the 6-month margin); `"expiring-soon"` when
   *  it's technically still valid on the flight date but doesn't clear the required margin;
   *  `"valid"` otherwise. */
  status: PassportValidityStatus;
  /** The earliest expiry date that would satisfy the rule for this flight date. */
  requiredExpiryDate: Date;
  /** Whole months between the flight date and the passport's actual expiry (can be negative if
   *  already expired by the flight date). Rounded down (a partial month short of the requirement
   *  still counts as short). */
  monthsRemaining: number;
}

/** Parses a `YYYY-MM-DD` date-only string (the shape every date `<input>` in this codebase
 *  produces) as a UTC midnight `Date`, so day-of-month arithmetic isn't shifted by the browser's
 *  local timezone - two dates a calendar day apart must never accidentally land on the same UTC
 *  day (or vice versa) depending on where the browser happens to be. */
function parseDateOnly(value: Date | string): Date {
  if (value instanceof Date) {
    return value;
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) {
    throw new Error(`Expected a YYYY-MM-DD date string, got: ${value}`);
  }
  const [, year, month, day] = match;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
}

function addMonthsUTC(date: Date, months: number): Date {
  const result = new Date(date.getTime());
  result.setUTCMonth(result.getUTCMonth() + months);
  return result;
}

/** Whole months between two dates (`to` minus `from`), rounded down - e.g. 5 months and 29 days
 *  is `5`, not `6`: a passport must *clear* the requirement, not merely come close to it. */
function wholeMonthsBetween(from: Date, to: Date): number {
  let months =
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 + (to.getUTCMonth() - from.getUTCMonth());
  if (to.getUTCDate() < from.getUTCDate()) {
    months -= 1;
  }
  return months;
}

/**
 * Checks a passport's expiry date against a flight date under the common "N months after travel"
 * rule. Accepts either `Date` objects or `YYYY-MM-DD` strings (what every date `<input>` in this
 * app produces) so it can be called directly from form state without a manual conversion step.
 */
export function checkPassportValidity(
  passportExpiryDate: Date | string,
  flightDate: Date | string,
  minValidityMonths: number = DEFAULT_MIN_PASSPORT_VALIDITY_MONTHS
): PassportValidityResult {
  const expiry = parseDateOnly(passportExpiryDate);
  const flight = parseDateOnly(flightDate);
  const requiredExpiryDate = addMonthsUTC(flight, minValidityMonths);
  const monthsRemaining = wholeMonthsBetween(flight, expiry);

  const status: PassportValidityStatus =
    expiry.getTime() < flight.getTime() ? "expired" : expiry.getTime() < requiredExpiryDate.getTime() ? "expiring-soon" : "valid";

  return {
    valid: status === "valid",
    status,
    requiredExpiryDate,
    monthsRemaining,
  };
}

/**
 * A Zod string schema for a `YYYY-MM-DD` passport expiry date, refined against `flightDate` under
 * the {@link checkPassportValidity} rule. `flightDate` is captured at schema-creation time (not a
 * cross-field `.refine()` on the whole form) so this composes into any form's field-level schema
 * the same way `z.string().min(1)` would - see `passport-validity.test.ts` for exact boundary
 * behavior, and checkout-form.tsx's own inline `.refine()` for the (weaker) check this can replace.
 */
export function createPassportExpirySchema(
  flightDate: string,
  minValidityMonths: number = DEFAULT_MIN_PASSPORT_VALIDITY_MONTHS
) {
  return z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide")
    .superRefine((value, ctx) => {
      // The .regex() check above already reports malformed input as its own issue; Zod runs
      // every check on a schema regardless of earlier ones failing, so this still executes on
      // a malformed value - skip rather than let parseDateOnly() throw a raw (non-Zod) error.
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return;
      }
      const result = checkPassportValidity(value, flightDate, minValidityMonths);
      if (result.valid) {
        return;
      }
      ctx.addIssue({
        code: "custom",
        message:
          result.status === "expired"
            ? "Le passeport est expiré à la date du voyage"
            : `Le passeport doit rester valide au moins ${minValidityMonths} mois après la date du voyage`,
      });
    });
}

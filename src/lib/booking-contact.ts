const KEY = "guentours_checkout_contact_email";

/**
 * Guest (unauthenticated) checkout has no account login, so the backend now gates read/cancel
 * access to a booking/payment/tickets on the contact email it was made with (see
 * BookingService.verifyGuestAccess) instead of leaving those endpoints open to anyone who
 * guesses the id. Remembered here for the lifetime of the tab so every page in the
 * checkout -> payment -> tracking -> tickets chain (including the Flutterwave 3DS redirect
 * round trip, which survives sessionStorage) can supply it automatically.
 */
export function rememberContactEmail(email: string) {
  try {
    sessionStorage.setItem(KEY, email);
  } catch {
    // sessionStorage unavailable (SSR, private browsing) - guest access falls back to
    // whatever an authenticated session provides, if any.
  }
}

export function getRememberedContactEmail(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

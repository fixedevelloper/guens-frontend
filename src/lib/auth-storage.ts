// Thin localStorage wrapper for the user profile shown in the UI. The JWT itself never touches
// this file (or any other JS-reachable storage): it lives only in the HttpOnly `gt_auth` cookie
// the backend sets on login/register/OAuth2 (see AuthCookieService), so an XSS payload has
// nothing to read here that would let it impersonate the user against the API.

const PROFILE_KEY = "guentours.profile";

export type UserRole =
  | "CUSTOMER"
  | "ADMIN"
  | "PARTNER_AIRLINE"
  | "PARTNER_HOTEL"
  | "PARTNER_CAR_RENTAL"
  | "PARTNER_FURNISHED_RENTAL"
  | "RESELLER";

export type ResellerStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface StoredProfile {
  email: string;
  fullName: string;
  role: UserRole;
  partnerId?: string; // présent uniquement pour les comptes partenaires
  resellerStatus?: ResellerStatus | string; // 👈 Ajouter cette propriété
  resellerId?: string; // 👈 (Optionnel mais recommandé si présent dans le JWT/Session)
}

export function getStoredProfile(): StoredProfile | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredProfile;
  } catch {
    return null;
  }
}

/** Caches the profile for instant UI rendering on next load. Not a credential by itself - actual
 *  access is always re-checked against the HttpOnly auth cookie on every API call. */
export function saveProfile(profile: StoredProfile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function clearProfile() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PROFILE_KEY);
}
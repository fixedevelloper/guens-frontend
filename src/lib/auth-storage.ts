// Thin localStorage wrapper for the JWT + user profile. Kept separate from AuthContext so
// the axios client (which has no React context) can read the token synchronously too.

const TOKEN_KEY = "guentours.token";
const PROFILE_KEY = "guentours.profile";

export type UserRole =
    | "CUSTOMER"
    | "ADMIN"
    | "PARTNER_AIRLINE"
    | "PARTNER_HOTEL"
    | "PARTNER_CAR_RENTAL"
    | "PARTNER_FURNISHED_RENTAL";

export interface StoredProfile {
  email: string;
  fullName: string;
  role: UserRole;
  partnerId?: string; // présent uniquement pour les comptes partenaires
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
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

export function saveAuthSession(token: string, profile: StoredProfile) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(PROFILE_KEY);
}
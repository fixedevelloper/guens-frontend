// Thin localStorage wrapper for the cookie-consent decision, following the same dotted-key
// convention as auth-storage.ts. Purely a client-side preference: the site's only cookies today
// (gt_auth, XSRF-TOKEN, NEXT_LOCALE) are all strictly necessary and are never gated by this -
// the "analytics" category exists so a future tracking script has a ready-made on/off switch to
// check before loading, without needing another consent flow built from scratch then.

const CONSENT_KEY = "guentours.cookie-consent";

export interface ConsentPreferences {
  necessary: true;
  analytics: boolean;
}

export interface ConsentRecord {
  preferences: ConsentPreferences;
  decidedAt: string;
}

export function getStoredConsent(): ConsentRecord | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(CONSENT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ConsentRecord;
  } catch {
    return null;
  }
}

export function saveConsent(preferences: ConsentPreferences): ConsentRecord {
  const record: ConsentRecord = { preferences, decidedAt: new Date().toISOString() };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
  }
  return record;
}

"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  getStoredConsent,
  saveConsent,
  type ConsentPreferences,
  type ConsentRecord,
} from "@/lib/cookie-consent";

interface CookieConsentContextValue {
  consent: ConsentRecord | null;
  isBannerOpen: boolean;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  savePreferences: (preferences: Pick<ConsentPreferences, "analytics">) => void;
  openPreferences: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextValue | undefined>(undefined);

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentRecord | null>(null);
  const [isBannerOpen, setIsBannerOpen] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    setConsent(stored);
    // No stored decision yet -> this is a first visit, show the banner.
    setIsBannerOpen(stored === null);
  }, []);

  const value = useMemo<CookieConsentContextValue>(
      () => ({
        consent,
        isBannerOpen,
        acceptAll() {
          setConsent(saveConsent({ necessary: true, analytics: true }));
          setIsBannerOpen(false);
        },
        rejectNonEssential() {
          setConsent(saveConsent({ necessary: true, analytics: false }));
          setIsBannerOpen(false);
        },
        savePreferences(preferences) {
          setConsent(saveConsent({ necessary: true, analytics: preferences.analytics }));
          setIsBannerOpen(false);
        },
        openPreferences() {
          setIsBannerOpen(true);
        },
      }),
      [consent, isBannerOpen]
  );

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error("useCookieConsent must be used within a CookieConsentProvider");
  }
  return context;
}

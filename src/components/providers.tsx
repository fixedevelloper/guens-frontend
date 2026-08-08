// components/providers.tsx
"use client";

import React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";
import { AuthProvider } from "@/context/auth-context";
import { CookieConsentProvider } from "@/context/cookie-consent-context";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
      <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
      >
        <QueryProvider>
          <AuthProvider>
            <CookieConsentProvider>
              {children}
              <CookieConsentBanner />
            </CookieConsentProvider>
          </AuthProvider>
        </QueryProvider>
      </ThemeProvider>
  );
}
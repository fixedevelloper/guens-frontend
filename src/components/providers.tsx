// components/providers.tsx
"use client";

import React from "react";
import { ThemeProvider } from "@/components/theme-provider"; // Ou NextThemesProvider
import { QueryProvider } from "@/components/query-provider";
import { AuthProvider } from "@/context/auth-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import * as authApi from "@/lib/api/auth";
import type { LoginRequest, RegisterRequest } from "@/lib/api/types";
import {
  clearProfile,
  getStoredProfile,
  saveProfile,
  type StoredProfile,
} from "@/lib/auth-storage";

const PARTNER_ROLES = [
  "PARTNER_AIRLINE",
  "PARTNER_HOTEL",
  "PARTNER_CAR_RENTAL",
  "PARTNER_FURNISHED_RENTAL",
] as const;

interface AuthContextValue {
  user: StoredProfile | null;
  partnerId: string | null; // Exposé directement pour simplifier l'accès
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPartner: boolean;
  /** AGENT or ADMIN - matches the backend's /api/agent/** rule (an admin can also validate manual
   *  payments without needing a second account, see ManualPaymentGateway/AgentPaymentController). */
  isAgent: boolean;
  isHydrated: boolean;
  login: (request: LoginRequest) => Promise<StoredProfile>;
  register: (request: RegisterRequest) => Promise<StoredProfile>;
  completeSocialLogin: () => Promise<StoredProfile>;
  requestPasswordReset: (email: string) => Promise<void>;
    resetPassword: (token: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredProfile | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Optimistic hydration from the cached profile - it's not a credential, just a UI cache.
    // Real access is re-checked against the HttpOnly auth cookie on every API call; a stale/absent
    // cookie surfaces as a 401, which the axios interceptor turns into clearProfile().
    const profile = getStoredProfile();
    // TEMPORARY diagnostic (prod login bug investigation) - remove once root-caused.
    console.warn("[AuthProvider] hydration read from localStorage", profile);
    if (profile) {
      setUser(profile);
      // The cached profile can be stale (e.g. a reseller approved after login, or a profile cached
      // before resellerId was part of AuthResponse) - resync it from the server in the background.
      authApi
        .me()
        .then((response) => {
          const fresh: StoredProfile = {
            email: response.email,
            fullName: response.fullName,
            role: response.role,
            partnerId: response.partnerId,
            resellerId: response.resellerId ?? undefined,
            phone: response.phone ?? undefined,
          };
          saveProfile(fresh);
          setUser(fresh);
        })
        .catch(() => {});
    }
    setIsHydrated(true);
    // Fire-and-forget: primes the XSRF-TOKEN cookie so it's already there by the time the user
    // submits any authenticated mutating request (login/register/logout don't trigger it - they're
    // CSRF-exempt, so nothing would otherwise ever cause Spring to issue that cookie).
    authApi.primeCsrf().catch(() => {});
  }, []);

  const value = useMemo<AuthContextValue>(
      () => ({
        user,
        partnerId: user?.partnerId ?? null, // Récupération directe
        isAuthenticated: user !== null,
        isAdmin: user?.role === "ADMIN",
        isPartner: user !== null && PARTNER_ROLES.includes(user.role as (typeof PARTNER_ROLES)[number]),
        isAgent: user?.role === "AGENT" || user?.role === "ADMIN",
        isHydrated,
        async login(request) {
          // The backend sets the HttpOnly gt_auth cookie on this response; there is no token in
          // the body to store client-side, just the profile shown in the UI.
          const response = await authApi.login(request);
          const profile = {
              id:response.userId,
            email: response.email,
            fullName: response.fullName,
            role: response.role,
            partnerId: response.partnerId,
            resellerId: response.resellerId ?? undefined,
            phone: response.phone ?? undefined,
          };
          // TEMPORARY diagnostic (prod login bug investigation) - remove once root-caused.
          console.warn("[AuthProvider] login resolved", { response, profile });
          saveProfile(profile);
          setUser(profile);
          return profile;
        },
        async register(request) {
          const response = await authApi.register(request);
          const profile = {
            id:response.userId,
            email: response.email,
            fullName: response.fullName,
            role: response.role,
            partnerId: response.partnerId,
            resellerId: response.resellerId ?? undefined,
            phone: response.phone ?? undefined,
          };
          saveProfile(profile);
          setUser(profile);
          return profile;
        },
        /**
         * Finishes a Google/Facebook login: the backend redirect already set the HttpOnly auth
         * cookie (see /auth/callback), so the only thing left to do is fetch the profile it
         * unlocks and cache it exactly like the tail end of a classic login.
         */
        async completeSocialLogin() {
          const response = await authApi.me();
          const profile = {
            id: response.userId,
            email: response.email,
            fullName: response.fullName,
            role: response.role,
            partnerId: response.partnerId,
            resellerId: response.resellerId ?? undefined,
            phone: response.phone ?? undefined,
          };
          saveProfile(profile);
          setUser(profile);
          return profile;
        },
        async requestPasswordReset(email) {
                   await authApi.requestPasswordReset(email);
                 },
          async resetPassword(token, newPassword) {
                       await authApi.resetPassword(token, newPassword);
                      },
        async logout() {
          clearProfile();
          setUser(null);
          await authApi.logout().catch(() => {});
        },
      }),
      [user, isHydrated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
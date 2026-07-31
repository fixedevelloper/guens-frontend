"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import * as authApi from "@/lib/api/auth";
import type { LoginRequest, RegisterRequest } from "@/lib/api/types";
import {
  clearAuthSession,
  getStoredProfile,
  getStoredToken,
  saveAuthSession,
  setStoredToken,
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
  isHydrated: boolean;
  login: (request: LoginRequest) => Promise<StoredProfile>;
  register: (request: RegisterRequest) => Promise<StoredProfile>;
  completeSocialLogin: (token: string) => Promise<StoredProfile>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredProfile | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    const profile = getStoredProfile();
    if (token && profile) {
      setUser(profile);
    }
    setIsHydrated(true);
  }, []);

  const value = useMemo<AuthContextValue>(
      () => ({
        user,
        partnerId: user?.partnerId ?? null, // Récupération directe
        isAuthenticated: user !== null,
        isAdmin: user?.role === "ADMIN",
        isPartner: user !== null && PARTNER_ROLES.includes(user.role as (typeof PARTNER_ROLES)[number]),
        isHydrated,
        async login(request) {
          const response = await authApi.login(request);
          const profile = {
              id:response.userId,
            email: response.email,
            fullName: response.fullName,
            role: response.role,
            partnerId: response.partnerId,
          };
          saveAuthSession(response.token, profile);
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
          };
          saveAuthSession(response.token, profile);
          setUser(profile);
          return profile;
        },
        /**
         * Finishes a Google/Facebook login: the backend redirect only carried the JWT (see
         * /auth/callback), so the token is stored first - the very next call (fetching the
         * profile) needs it as a Bearer header - then the full profile is fetched and saved
         * exactly like a classic login.
         */
        async completeSocialLogin(token) {
          setStoredToken(token);
          const response = await authApi.me();
          const profile = {
            id: response.userId,
            email: response.email,
            fullName: response.fullName,
            role: response.role,
            partnerId: response.partnerId,
          };
          saveAuthSession(token, profile);
          setUser(profile);
          return profile;
        },
        logout() {
          clearAuthSession();
          setUser(null);
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
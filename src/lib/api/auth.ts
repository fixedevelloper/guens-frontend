import { apiClient } from "./client";
import type { AuthResponse, LoginRequest, RegisterRequest } from "./types";

export async function login(request: LoginRequest) {
  const { data } = await apiClient.post<AuthResponse>("/api/auth/login", request);
  return data;
}

export async function register(request: RegisterRequest) {
  const { data } = await apiClient.post<AuthResponse>("/api/auth/register", request);
  return data;
}

/** Resolves the profile behind the currently-set Bearer token - used right after a social login
 *  redirect, which only carries the token itself, not the full profile. */
export async function me() {
  const { data } = await apiClient.get<AuthResponse>("/api/auth/me");
  return data;
}

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

/** Resolves the profile behind the HttpOnly auth cookie - used right after a social login
 *  redirect, which only sets that cookie, not the full profile. */
export async function me() {
  const { data } = await apiClient.get<AuthResponse>("/api/auth/me");
  return data;
}

/** Clears the HttpOnly auth cookie server-side. */
export async function logout(): Promise<void> {
  await apiClient.post("/api/auth/logout");
}

/** Forces the backend to issue the XSRF-TOKEN cookie (see AuthController#csrf) - call once on app
 *  bootstrap so it's already set before the first authenticated mutating request needs it. */
export async function primeCsrf(): Promise<void> {
  await apiClient.get("/api/auth/csrf");
}
export async function requestPasswordReset(email: string): Promise<void> {
  await apiClient.post("/api/auth/forgot-password", { email });
}
export async function resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post("/api/auth/reset-password", { token, newPassword });
  }

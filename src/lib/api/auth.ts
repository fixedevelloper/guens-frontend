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

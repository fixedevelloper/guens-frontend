import axios, { AxiosError } from "axios";

import type { ApiError } from "./types";
import { clearProfile } from "@/lib/auth-storage";

// withCredentials lets the browser attach the HttpOnly gt_auth cookie automatically - there is no
// token to read from JS and put in an Authorization header anymore. xsrfCookieName/xsrfHeaderName
// make axios echo Spring's CSRF cookie back as a header on mutating requests (double-submit
// pattern); withXSRFToken is required for that to still happen on this cross-origin (different
// port in dev, possibly different subdomain in prod) baseURL - axios 1.x only does it
// automatically for same-origin requests otherwise.
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

apiClient.interceptors.request.use((config) => {
  // Si la requête contient un FormData, on supprime le Content-Type explicite
  // pour laisser le navigateur générer "multipart/form-data; boundary=..."
  if (config.data instanceof FormData) {
    config.headers.delete("Content-Type");
  } else if (!config.headers.has("Content-Type")) {
    config.headers.set("Content-Type", "application/json");
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      clearProfile();
    }
    return Promise.reject(normalizeApiError(error));
  }
);

function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    "message" in value &&
    "error" in value
  );
}

/** Normalizes any axios failure into the backend's ApiError shape, falling back to a
 *  generic message for network errors that never reached the GlobalExceptionHandler.
 *  Idempotent: the axios interceptor above already rejects with a normalized ApiError,
 *  so call sites that call this again on that value (a plain object, neither an AxiosError
 *  nor an Error instance) must get it back unchanged instead of falling through to the
 *  "Unknown error" fallback. */
export function normalizeApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }
  if (axios.isAxiosError(error)) {
    if (error.response?.data && typeof error.response.data === "object") {
      return error.response.data as ApiError;
    }
    return {
      timestamp: new Date().toISOString(),
      status: error.response?.status ?? 0,
      error: error.response ? "Request Failed" : "Network Error",
      message: error.response
        ? "Le serveur a répondu de façon inattendue. Veuillez réessayer."
        : "Impossible de contacter le serveur. Vérifiez votre connexion et réessayez.",
      details: [],
    };
  }
  return {
    timestamp: new Date().toISOString(),
    status: 0,
    error: "Unknown Error",
    message: error instanceof Error ? error.message : "Unknown error",
    details: [],
  };
}
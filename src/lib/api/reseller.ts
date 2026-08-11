import { apiClient } from "./client";
import {
  ResellerFormData,
  ResellerResponse,
  PageResponse,
  ResellerProfile,
  ResellerCommissionEntry,
  ResellerBalance,
  ResellerWithdrawalEntry,
  ResellerWithdrawalRequestPayload,
} from "./types";
import type { ResellerBookingResponse } from "@/components/dashboard/ResellerBookingsTable";

export async function createReseller(
  payload: ResellerFormData
): Promise<ResellerResponse> {
  const formData = new FormData();

  console.log(payload)
  // 1. DTO envoyé sous forme de Blob application/json pour @RequestPart("request")
  const requestDto = {
    companyName: payload.companyName,
    registrationNumber: payload.registrationNumber,
    contactName: payload.contactName,
    email: payload.email,
    phone: payload.phone,
    city: payload.city,
    country: payload.country,
    description: payload.description,
  };

  formData.append(
    "request",
    new Blob([JSON.stringify(requestDto)], { type: "application/json" })
  );

  // 2. Fichier envoyé séparément pour @RequestPart("logo")
  if (payload.logo) {
    formData.append("logo", payload.logo);
  }
  console.log(formData)

  // 3. Envoi vers l'endpoint Spring Boot
  const { data } = await apiClient.post<ResellerResponse>(
    `/api/resellers/register-with-logo`,
    formData
  );

  return data;
}

// ---------- Reseller self-service dashboard (real ResellerController endpoints) ----------
// #id in every route below is enforced server-side to match authentication.principal.resellerId
// (or an admin) - see ResellerController - so these calls are always scoped to the caller's own
// reseller account.

export async function getResellerProfile(resellerId: string): Promise<ResellerProfile> {
  const { data } = await apiClient.get<ResellerProfile>(`/api/resellers/${resellerId}`);
  return data;
}

export async function getMyResellerBookings(
  resellerId: string,
  page = 0,
  size = 20
): Promise<PageResponse<ResellerBookingResponse>> {
  const { data } = await apiClient.get<PageResponse<ResellerBookingResponse>>(
    `/api/resellers/${resellerId}/bookings`,
    { params: { page, size } }
  );
  return data;
}

export async function getMyResellerCommissions(
  resellerId: string,
  page = 0,
  size = 20
): Promise<PageResponse<ResellerCommissionEntry>> {
  const { data } = await apiClient.get<PageResponse<ResellerCommissionEntry>>(
    `/api/resellers/${resellerId}/commissions`,
    { params: { page, size } }
  );
  return data;
}

export async function getMyResellerBalance(resellerId: string): Promise<ResellerBalance> {
  const { data } = await apiClient.get<ResellerBalance>(`/api/resellers/${resellerId}/balance`);
  return data;
}

export async function getMyResellerWithdrawals(
  resellerId: string,
  page = 0,
  size = 20
): Promise<PageResponse<ResellerWithdrawalEntry>> {
  const { data } = await apiClient.get<PageResponse<ResellerWithdrawalEntry>>(
    `/api/resellers/${resellerId}/withdrawals`,
    { params: { page, size } }
  );
  return data;
}

export async function requestResellerWithdrawal(
  resellerId: string,
  payload: ResellerWithdrawalRequestPayload
): Promise<ResellerWithdrawalEntry> {
  const { data } = await apiClient.post<ResellerWithdrawalEntry>(
    `/api/resellers/${resellerId}/withdrawals`,
    payload
  );
  return data;
}
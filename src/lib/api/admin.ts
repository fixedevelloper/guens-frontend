import { apiClient } from "./client";
import type {
  AdminUserResponse,
  BookingResponse,
  CommissionWalletBalanceResponse,
  PageResponse,
  PartnerResponse,
  PartnerStatus,
  ResellerApprovalRequest,
  ResellerBooking,
  ResellerResponse,
  ResellerStatus,
  ResellerWithdrawal,
} from "./types";

export async function getAdminBookings() {
  const { data } = await apiClient.get<BookingResponse[]>("/api/admin/bookings");
  return data;
}

export async function getAdminUsers() {
  const { data } = await apiClient.get<AdminUserResponse[]>("/api/admin/users");
  return data;
}

export async function getCommissionWallet() {
  const { data } = await apiClient.get<CommissionWalletBalanceResponse>("/api/admin/commission/wallet");
  return data;
}

export async function getAdminPartners(status: PartnerStatus | undefined, page: number, size = 20) {
  const { data } = await apiClient.get<PageResponse<PartnerResponse>>("/api/partners", {
    params: { status, page, size },
  });
  return data;
}

export async function approvePartner(partnerId: string) {
  const { data } = await apiClient.patch<PartnerResponse>(`/api/partners/${partnerId}/approve`);
  return data;
}

export async function rejectPartner(partnerId: string) {
  const { data } = await apiClient.patch<PartnerResponse>(`/api/partners/${partnerId}/reject`);
  return data;
}
export interface SyncResponse {
  synced: number;
}

export async function syncAirports(): Promise<{ synced: number }> {
  const { data } = await apiClient.post<{ synced: number }>("/api/admin/geo/airports/sync");
  return data;
}

export async function syncCities(): Promise<{ synced: number }> {
  const { data } = await apiClient.post<{ synced: number }>("/api/admin/geo/cities/sync");
  return data;
}

// Liste paginée des revendeurs avec filtre optionnel par statut
export async function getAdminResellers(
  status: ResellerStatus | undefined,
  page: number,
  size = 20
) {
  const { data } = await apiClient.get<PageResponse<ResellerResponse>>("/api/resellers", {
    params: { status, page, size },
  });
  return data;
}

// Détail d'un revendeur
export async function getResellerDetail(resellerId: string): Promise<ResellerResponse> {
  const { data } = await apiClient.get<ResellerResponse>(`/api/resellers/${resellerId}`);
  return data;
}

// Réservations générées par le code promo du revendeur
export async function getResellerBookings(
  resellerId: string,
  page = 0,
  size = 10
): Promise<PageResponse<ResellerBooking>> {
  const { data } = await apiClient.get<PageResponse<ResellerBooking>>(
    `/api/resellers/${resellerId}/bookings`,
    { params: { page, size } }
  );
  return data;
}

// Historique des demandes de retraits/wallet
export async function getResellerWithdrawals(
  resellerId: string,
  page = 0,
  size = 10
): Promise<PageResponse<ResellerWithdrawal>> {
  const { data } = await apiClient.get<PageResponse<ResellerWithdrawal>>(
    `/api/resellers/${resellerId}/withdrawals`,
    { params: { page, size } }
  );
  return data;
}

// Approbation avec fixation du taux
export async function approveReseller(
  resellerId: string,
  payload: ResellerApprovalRequest
): Promise<ResellerResponse> {
  const { data } = await apiClient.patch<ResellerResponse>(
    `/api/resellers/${resellerId}/approve`,
    payload
  );
  return data;
}

// Rejet
export async function rejectReseller(resellerId: string): Promise<ResellerResponse> {
  const { data } = await apiClient.patch<ResellerResponse>(
    `/api/resellers/${resellerId}/reject`
  );
  return data;
}

// Mise à jour de la commission
export async function updateResellerCommission(
  resellerId: string,
  payload: ResellerApprovalRequest
): Promise<ResellerResponse> {
  const { data } = await apiClient.patch<ResellerResponse>(
    `/api/resellers/${resellerId}/commission`,
    payload
  );
  return data;
}

// Suspension
export async function suspendReseller(resellerId: string): Promise<ResellerResponse> {
  const { data } = await apiClient.patch<ResellerResponse>(
    `/api/resellers/${resellerId}/suspend`
  );
  return data;
}
export interface SyncResponse {
  synced: number;
}
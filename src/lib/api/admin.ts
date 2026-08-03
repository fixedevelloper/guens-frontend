import { apiClient } from "./client";
import type {
  AdminUserResponse,
  BookingResponse,
  CommissionWalletBalanceResponse,
  FeaturedDestinationAdminResponse,
  FeaturedDestinationUpsertRequest,
  HotelCityAdminResponse,
  HotelCityUpsertRequest,
  PageResponse,
  PartnerResponse,
  PartnerStatus,
  PaymentProviderRouteRequest,
  PaymentProviderRouteResponse,
  Reseller,
  ResellerApprovalRequest,
  ResellerBooking,
  ResellerDetail,
  ResellerResponse,
  ResellerStatus,
  ResellerWithdrawal,
  ShareholderRequest,
  ShareholderResponse,
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

export async function getShareholders() {
  const { data } = await apiClient.get<ShareholderResponse[]>("/api/admin/commission/shareholders");
  return data;
}

export async function createShareholder(payload: ShareholderRequest) {
  const { data } = await apiClient.post<ShareholderResponse>("/api/admin/commission/shareholders", payload);
  return data;
}

export async function updateShareholder(id: string, payload: ShareholderRequest) {
  const { data } = await apiClient.put<ShareholderResponse>(`/api/admin/commission/shareholders/${id}`, payload);
  return data;
}

export async function getPaymentProviderRoutes() {
  const { data } = await apiClient.get<PaymentProviderRouteResponse[]>("/api/admin/payment-provider-routes");
  return data;
}

export async function getAvailablePaymentProviders() {
  const { data } = await apiClient.get<string[]>("/api/admin/payment-provider-routes/available-providers");
  return data;
}

export async function createPaymentProviderRoute(payload: PaymentProviderRouteRequest) {
  const { data } = await apiClient.post<PaymentProviderRouteResponse>("/api/admin/payment-provider-routes", payload);
  return data;
}

export async function updatePaymentProviderRoute(id: string, payload: PaymentProviderRouteRequest) {
  const { data } = await apiClient.put<PaymentProviderRouteResponse>(`/api/admin/payment-provider-routes/${id}`, payload);
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

export interface AdminCitiesQuery {
  q?: string;
  sort?: string; // Spring Data format: "cityName,asc" / "countryName,desc"
}

export async function getAdminCities(page: number, size = 20, query: AdminCitiesQuery = {}) {
  const { data } = await apiClient.get<PageResponse<HotelCityAdminResponse>>("/api/admin/geo/cities", {
    params: { page, size, q: query.q || undefined, sort: query.sort },
  });
  return data;
}

export async function createCity(payload: HotelCityUpsertRequest) {
  const { data } = await apiClient.post<HotelCityAdminResponse>("/api/admin/geo/cities", payload);
  return data;
}

export async function updateCity(id: number, payload: HotelCityUpsertRequest) {
  const { data } = await apiClient.put<HotelCityAdminResponse>(`/api/admin/geo/cities/${id}`, payload);
  return data;
}

export async function deleteCity(id: number) {
  await apiClient.delete(`/api/admin/geo/cities/${id}`);
}

// --- Destinations mises en avant (page d'accueil) ---

export async function getAdminDestinations() {
  const { data } = await apiClient.get<FeaturedDestinationAdminResponse[]>("/api/admin/destinations");
  return data;
}

export async function createDestination(payload: FeaturedDestinationUpsertRequest) {
  const { data } = await apiClient.post<FeaturedDestinationAdminResponse>("/api/admin/destinations", payload);
  return data;
}

export async function updateDestination(id: string, payload: FeaturedDestinationUpsertRequest) {
  const { data } = await apiClient.put<FeaturedDestinationAdminResponse>(`/api/admin/destinations/${id}`, payload);
  return data;
}

export async function deleteDestination(id: string) {
  await apiClient.delete(`/api/admin/destinations/${id}`);
}

export async function refreshDestinationsFromBookings() {
  const { data } = await apiClient.post<{ added: number }>("/api/admin/destinations/refresh-from-bookings");
  return data;
}

// Liste paginée des revendeurs avec filtre optionnel par statut
export async function getAdminResellers(
  status: ResellerStatus | undefined,
  page: number,
  size = 20
) {
  const { data } = await apiClient.get<PageResponse<Reseller>>("/api/resellers", {
    params: { status, page, size },
  });
  return data;
}

// Détail d'un revendeur
export async function getResellerDetail(resellerId: string | number): Promise<ResellerDetail> {
  const { data } = await apiClient.get<ResellerDetail>(`/api/resellers/${resellerId}`);
  return data;
}

// Réservations générées par le code promo du revendeur
export async function getResellerBookings(
 resellerId: string | number,
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
  resellerId: string | number,
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
  resellerId: string | number,
  payload: ResellerApprovalRequest
): Promise<ResellerResponse> {
  const { data } = await apiClient.patch<ResellerResponse>(
    `/api/resellers/${resellerId}/approve`,
    payload
  );
  return data;
}

// Rejet
export async function rejectReseller(resellerId: string | number): Promise<ResellerResponse> {
  const { data } = await apiClient.patch<ResellerResponse>(
    `/api/resellers/${resellerId}/reject`
  );
  return data;
}

// Mise à jour de la commission
export async function updateResellerCommission(
 resellerId: string | number,
  payload: ResellerApprovalRequest
): Promise<ResellerResponse> {
  const { data } = await apiClient.patch<ResellerResponse>(
    `/api/resellers/${resellerId}/commission`,
    payload
  );
  return data;
}

// Suspension
export async function suspendReseller(resellerId: string | number): Promise<ResellerResponse> {
  const { data } = await apiClient.patch<ResellerResponse>(
    `/api/resellers/${resellerId}/suspend`
  );
  return data;
}
export interface SyncResponse {
  synced: number;
}
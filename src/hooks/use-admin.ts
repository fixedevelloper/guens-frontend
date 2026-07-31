import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as adminApi from "@/lib/api/admin";
import type {
  HotelCityUpsertRequest,
  PartnerStatus,
  PaymentProviderRouteRequest,
  ResellerApprovalRequest,
  ResellerStatus,
  ShareholderRequest,
  UpdateCommissionPayload,
} from "@/lib/api/types";

export function useAdminBookingsQuery() {
  return useQuery({
    queryKey: ["admin-bookings"],
    queryFn: () => adminApi.getAdminBookings(),
  });
}

export function useAdminUsersQuery() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminApi.getAdminUsers(),
  });
}

export function useShareholdersQuery() {
  return useQuery({
    queryKey: ["shareholders"],
    queryFn: () => adminApi.getShareholders(),
  });
}

export function useCreateShareholderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ShareholderRequest) => adminApi.createShareholder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shareholders"] });
    },
  });
}

export function useUpdateShareholderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ShareholderRequest }) =>
      adminApi.updateShareholder(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shareholders"] });
    },
  });
}

export function usePaymentProviderRoutesQuery() {
  return useQuery({
    queryKey: ["payment-provider-routes"],
    queryFn: () => adminApi.getPaymentProviderRoutes(),
  });
}

export function useAvailablePaymentProvidersQuery() {
  return useQuery({
    queryKey: ["payment-provider-routes", "available-providers"],
    queryFn: () => adminApi.getAvailablePaymentProviders(),
  });
}

export function useCreatePaymentProviderRouteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PaymentProviderRouteRequest) => adminApi.createPaymentProviderRoute(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-provider-routes"] });
    },
  });
}

export function useUpdatePaymentProviderRouteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PaymentProviderRouteRequest }) =>
      adminApi.updatePaymentProviderRoute(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-provider-routes"] });
    },
  });
}

export function useCommissionWalletQuery() {
  return useQuery({
    queryKey: ["commission-wallet"],
    queryFn: () => adminApi.getCommissionWallet(),
  });
}

export function useAdminPartnersQuery(status: PartnerStatus | "ALL", page: number) {
  return useQuery({
    queryKey: ["admin-partners", status, page],
    queryFn: () => adminApi.getAdminPartners(status === "ALL" ? undefined : status, page),
  });
}

export function useApprovePartnerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (partnerId: string) => adminApi.approvePartner(partnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
    },
  });
}

export function useRejectPartnerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (partnerId: string) => adminApi.rejectPartner(partnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
    },
  });
}

// --- Sync Référentiels Géo ---

export function useSyncAirportsMutation() {
  return useMutation({
    mutationFn: () => adminApi.syncAirports(),
  });
}

export function useSyncCitiesMutation() {
  return useMutation({
    mutationFn: () => adminApi.syncCities(),
  });
}

export function useAdminCitiesQuery(page: number, query: adminApi.AdminCitiesQuery = {}) {
  return useQuery({
    queryKey: ["admin-cities", page, query.q, query.sort],
    queryFn: () => adminApi.getAdminCities(page, 20, query),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateCityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: HotelCityUpsertRequest) => adminApi.createCity(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cities"] });
    },
  });
}

export function useUpdateCityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: HotelCityUpsertRequest }) =>
      adminApi.updateCity(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cities"] });
    },
  });
}

export function useDeleteCityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteCity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cities"] });
    },
  });
}
export const resellerKeys = {
  all: ["resellers"] as const,
  lists: () => [...resellerKeys.all, "list"] as const,
  list: (status?: ResellerStatus, page?: number) =>
    [...resellerKeys.lists(), { status, page }] as const,
  details: () => [...resellerKeys.all, "detail"] as const,
  detail: (id: string) => [...resellerKeys.details(), id] as const,
  bookings: (id: string, page?: number) =>
    [...resellerKeys.detail(id), "bookings", { page }] as const,
  withdrawals: (id: string, page?: number) =>
    [...resellerKeys.detail(id), "withdrawals", { page }] as const,
};

// Liste paginée
export function useAdminResellersQuery(status?: ResellerStatus, page = 0, size = 20) {
  return useQuery({
    queryKey: resellerKeys.list(status, page),
    queryFn: () => adminApi.getAdminResellers(status, page, size),
  });
}

// Détail revendeur
export function useAdminResellerDetailQuery(resellerId: string) {
  return useQuery({
    queryKey: resellerKeys.detail(resellerId),
    queryFn: () => adminApi.getResellerDetail(resellerId),
    enabled: !!resellerId,
  });
}

// Réservations
export function useAdminResellerBookingsQuery(resellerId: string, page = 0, size = 10) {
  return useQuery({
    queryKey: resellerKeys.bookings(resellerId, page),
    queryFn: () => adminApi.getResellerBookings(resellerId, page, size),
    enabled: !!resellerId,
  });
}

// Retraits
export function useAdminResellerWithdrawalsQuery(resellerId: string, page = 0, size = 10) {
  return useQuery({
    queryKey: resellerKeys.withdrawals(resellerId, page),
    queryFn: () => adminApi.getResellerWithdrawals(resellerId, page, size),
    enabled: !!resellerId,
  });
}

// Mutation Approbation
export function useApproveResellerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      resellerId,
      payload,
    }: {
      resellerId: string;
      payload: ResellerApprovalRequest;
    }) => adminApi.approveReseller(resellerId, payload),
    onSuccess: (reseller) => {
      queryClient.invalidateQueries({ queryKey: resellerKeys.detail(String(reseller.data.id)) });
      queryClient.invalidateQueries({ queryKey: resellerKeys.lists() });
    },
  });
}

// Mutation Rejet
export function useRejectResellerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (resellerId: string) => adminApi.rejectReseller(resellerId),
    onSuccess: (reseller) => {
      queryClient.invalidateQueries({ queryKey: resellerKeys.detail(String(reseller.data.id)) });
      queryClient.invalidateQueries({ queryKey: resellerKeys.lists() });
    },
  });
}

// Mutation Mise à jour Commission
export function useUpdateCommissionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      resellerId,
      payload,
    }: {
      resellerId: string;
      payload: ResellerApprovalRequest;
    }) => adminApi.updateResellerCommission(resellerId, payload),
    onSuccess: (reseller) => {
      queryClient.invalidateQueries({ queryKey: resellerKeys.detail(String(reseller.data.id)) });
    },
  });
}

// Mutation Suspension
export function useSuspendResellerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (resellerId: string) => adminApi.suspendReseller(resellerId),
    onSuccess: (reseller) => {
      queryClient.invalidateQueries({ queryKey: resellerKeys.detail(String(reseller.data.id)) });
      queryClient.invalidateQueries({ queryKey: resellerKeys.lists() });
    },
  });
}
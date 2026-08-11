import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as resellerApi from "@/lib/api/reseller";
import { ResellerFormData, ResellerWithdrawalRequestPayload } from "@/lib/api/types";

export function useCreateResellerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ResellerFormData) => resellerApi.createReseller(payload),
    onSuccess: () => {
      // Invalide le cache des revendeurs pour rafraîchir la liste
      queryClient.invalidateQueries({
        queryKey: ["resellers"],
      });
    },
  });
}

// ---------- Espace revendeur (self-service) ----------
// resellerId vient de useAuth().user?.resellerId ; ces hooks ne s'activent qu'une fois connu
// (enabled: !!resellerId) pour éviter un appel avec un id vide pendant l'hydratation.

export function useResellerProfileQuery(resellerId?: string) {
  return useQuery({
    queryKey: ["reseller-profile", resellerId],
    queryFn: () => resellerApi.getResellerProfile(resellerId as string),
    enabled: !!resellerId,
  });
}

export function useMyResellerBookingsQuery(resellerId?: string, page = 0, size = 20) {
  return useQuery({
    queryKey: ["reseller-my-bookings", resellerId, page, size],
    queryFn: () => resellerApi.getMyResellerBookings(resellerId as string, page, size),
    enabled: !!resellerId,
  });
}

export function useMyResellerCommissionsQuery(resellerId?: string, page = 0, size = 20) {
  return useQuery({
    queryKey: ["reseller-my-commissions", resellerId, page, size],
    queryFn: () => resellerApi.getMyResellerCommissions(resellerId as string, page, size),
    enabled: !!resellerId,
  });
}

export function useMyResellerBalanceQuery(resellerId?: string) {
  return useQuery({
    queryKey: ["reseller-my-balance", resellerId],
    queryFn: () => resellerApi.getMyResellerBalance(resellerId as string),
    enabled: !!resellerId,
  });
}

export function useMyResellerWithdrawalsQuery(resellerId?: string, page = 0, size = 20) {
  return useQuery({
    queryKey: ["reseller-my-withdrawals", resellerId, page, size],
    queryFn: () => resellerApi.getMyResellerWithdrawals(resellerId as string, page, size),
    enabled: !!resellerId,
  });
}

export function useRequestResellerWithdrawalMutation(resellerId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ResellerWithdrawalRequestPayload) =>
      resellerApi.requestResellerWithdrawal(resellerId as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reseller-my-withdrawals", resellerId] });
      queryClient.invalidateQueries({ queryKey: ["reseller-my-balance", resellerId] });
    },
  });
}
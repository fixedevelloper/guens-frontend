import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as bookingApi from "@/lib/api/booking";
import type { CheckoutRequest, MultiCityCheckoutRequest } from "@/lib/api/types";

export function useCheckoutMutation() {
  return useMutation({
    mutationFn: (request: CheckoutRequest) => bookingApi.checkout(request),
  });
}

export function useCheckoutMultiCityMutation() {
  return useMutation({
    mutationFn: (request: MultiCityCheckoutRequest) => bookingApi.checkoutMultiCity(request),
  });
}
interface UpdateBookingStatusPayload {
  bookingId: string;
  status: "CONFIRMED" | "CANCELLED";
}

export function useUpdateBookingStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, status }: UpdateBookingStatusPayload) =>
        bookingApi.updateBooking(bookingId, status),

    onSuccess: (data, variables) => {
      // Met à jour directement le cache avec les nouvelles données renvoyées par le serveur
      queryClient.setQueryData(["booking", variables.bookingId], data);

      // (Optionnel) Invalide aussi la liste globale des réservations si nécessaire
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useBookingQuery(bookingId: string | null) {
  return useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => bookingApi.getBooking(bookingId as string),
    enabled: bookingId !== null,
    // A booking's status can advance server-side (payment, async provider confirmation)
    // faster than the default staleTime, and the payment and tracking pages both query the
    // same id in quick succession - always refetch on mount instead of serving a cached,
    // possibly-stale status from the page the user was just on.
    staleTime: 0,
  });
}

export function useMyBookingsQuery() {
  return useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => bookingApi.getMyBookings(),
  });
}

export function useCancelBookingMutation(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => bookingApi.cancelBooking(bookingId),
    onSuccess: (data) => {
      queryClient.setQueryData(["booking", bookingId], data);
    },
  });
}

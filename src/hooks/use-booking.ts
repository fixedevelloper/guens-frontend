import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as bookingApi from "@/lib/api/booking";
import type { AncillaryOptionsRequest, CheckoutRequest, MultiCityCheckoutRequest } from "@/lib/api/types";

/**
 * Quotes priced extras for the "additional options" checkout step. Keyed by offerId + traveler
 * count rather than the full request (names are just placeholders at this stage, see
 * AncillaryOptionsStep) - a real name change shouldn't trigger a refetch. `staleTime: Infinity`
 * because the underlying OfferCache quote is only valid for one checkout session anyway.
 *
 * `enabled` is a separate flag from `request` on purpose: the caller keeps passing the same
 * `request` object once past the options step (so the queryKey - and therefore the already-fetched
 * `data` - stays stable) and only flips `enabled` to stop refetching. Passing `null` for `request`
 * itself once the step is done would change the queryKey and silently lose the cached options,
 * breaking the price recap on later steps.
 */
export function useAncillaryOptionsQuery(request: AncillaryOptionsRequest | null, enabled: boolean) {
  return useQuery({
    queryKey: ["ancillary-options", request?.offerId, request?.travelers.length],
    queryFn: () => bookingApi.getAncillaryOptions(request as AncillaryOptionsRequest),
    enabled: enabled && request !== null,
    staleTime: Infinity,
  });
}

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

export function useFlightOrderDetailQuery(bookingId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ["flight-order-detail", bookingId],
    queryFn: () => bookingApi.getFlightOrderDetail(bookingId as string),
    enabled: bookingId !== null && enabled,
    // Reflects the provider's live state (baggage/meals/seats can be added post-booking) - don't
    // serve a stale cached value from an earlier visit.
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

export function useUploadRequiredPassportImageMutation(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ travelerIndex, file }: { travelerIndex: number; file: File }) =>
      bookingApi.uploadRequiredPassportImage(bookingId, travelerIndex, file),
    onSuccess: (data) => {
      queryClient.setQueryData(["booking", bookingId], data);
    },
  });
}

export function useRetryBookingMutation(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => bookingApi.retryBooking(bookingId),
    onSuccess: (data) => {
      queryClient.setQueryData(["booking", bookingId], data);
    },
  });
}

/** Every 15 minutes while `enabled` (i.e. still PENDING_PAYMENT - see BookingTrackingPage),
 *  re-verifies the price with the supplier so a customer who takes a while to pay (manual mobile
 *  money, bank transfer...) doesn't get a stale amount by the time an agent books it for real.
 *  This is NOT a hold-expiry countdown - that's a separate, pre-existing backend job
 *  (BookingService#cancelExpiredHolds, tied to ticketingDeadline) this query never touches.
 *  useQuery (v5) has no onSuccess, so the caller syncs `data` into the shared ["booking", bookingId]
 *  cache itself once it changes, rather than this hook owning that effect. */
export const PRICE_REVALIDATION_INTERVAL_MS = 15 * 60 * 1000;

export function usePriceCheckQuery(bookingId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ["booking-price-check", bookingId],
    queryFn: () => bookingApi.priceCheck(bookingId as string),
    enabled: enabled && bookingId !== null,
    refetchInterval: PRICE_REVALIDATION_INTERVAL_MS,
    staleTime: 0,
  });
}

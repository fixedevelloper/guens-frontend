import { useMutation, useQuery } from "@tanstack/react-query";
import * as resellerBookingApi from "@/lib/api/reseller-booking";
import {CheckoutRequest, type MultiCityCheckoutRequest} from "@/lib/api/types";
import * as bookingApi from "@/lib/api/booking";
import {
    createBookingMultiCityHold,
    ResellerBookingCheckout,
    ResellerBookingCheckoutMultiCity
} from "@/lib/api/reseller-booking";


export function useCreateBookingHoldMutation() {
    return useMutation({
        mutationFn: (request: ResellerBookingCheckout) => resellerBookingApi.createBookingtHold(request),
    });
}
export function useCreateBookingMultiCityMutation() {
    return useMutation({
        mutationFn: (request: ResellerBookingCheckoutMultiCity) => resellerBookingApi.createBookingMultiCityHold(request),
    });
}
export function usePayBookingMutation(bookingId: string) {
    return useMutation({
        mutationFn: (payload: { paymentMethod: string; payerReference: string }) =>
            resellerBookingApi.payBooking(bookingId, payload),
    });
}

export function useBookingStatusQuery(bookingId: string, enabled: boolean) {
    return useQuery({
        queryKey: ["reseller-booking-status", bookingId],
        queryFn: () => resellerBookingApi.getBookingStatus(bookingId),
        enabled,
        // Poll tant que le billet n'est pas encore émis (CONFIRMING -> CONFIRMED est asynchrone
        // côté provider une fois le paiement capturé)
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            return status === "CONFIRMED" || status === "FAILED" ? false : 2000;
        },
    });
}
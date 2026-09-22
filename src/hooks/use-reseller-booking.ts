import { useMutation } from "@tanstack/react-query";
import * as resellerBookingApi from "@/lib/api/reseller-booking";
import {
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

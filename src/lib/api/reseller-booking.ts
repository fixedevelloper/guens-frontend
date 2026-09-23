import { apiClient } from "./client";
import {CheckoutRequest, MultiCityCheckoutRequest} from "@/lib/api/types";
/** markupRate : marge du revendeur en fraction (0.05 = 5 %), plafonnée côté serveur par la marge
 *  maximum fixée par l'admin. Le prix final est toujours calculé par le serveur. */
export interface ResellerBookingCheckout {
    checkout: CheckoutRequest;
    markupRate: number;
}
export interface ResellerBookingCheckoutMultiCity{
    checkout: MultiCityCheckoutRequest;
    markupRate: number;
}
export interface ResellerBookingResponse {
    id: string;
    resellerId: string;
    contactEmail: string;
    offerType: string;
    summary: string;
    ticketingDeadline: string | null;
    pnrCode: string | null;
    totalAmount: number;
    currency: string;
    status: string;
    travelerCount: number;
    createdAt: string;
    markupRate: number | null;
    markupAmount: number | null;
}
export async function createBookingtHold(payload: ResellerBookingCheckout) {
    const { data } = await apiClient.post<ResellerBookingResponse>(
        "/api/reseller/bookings",
        {
            checkoutRequest: payload.checkout,
            markupRate: payload.markupRate,
        }
    );
    return data;
}
export async function createBookingMultiCityHold(payload: ResellerBookingCheckoutMultiCity) {
    const { data } = await apiClient.post<ResellerBookingResponse>(
        "/api/reseller/bookings/multi-city",
        {
            checkoutRequest: payload.checkout,
            markupRate: payload.markupRate,
        }
    );
    return data;
}

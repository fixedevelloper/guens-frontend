import { apiClient } from "./client";
import {CheckoutRequest, MultiCityCheckoutRequest} from "@/lib/api/types";
export interface ResellerBookingCheckout {
    checkout: CheckoutRequest;
    customAmount:number
}
export interface ResellerBookingCheckoutMultiCity{
    checkout: MultiCityCheckoutRequest;
    customAmount:number
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
}
export async function createBookingtHold(payload: ResellerBookingCheckout) {
    const { data } = await apiClient.post<ResellerBookingResponse>(
        "/api/reseller/bookings",
        {
            checkoutRequest: payload.checkout,
            customAmount: payload.customAmount,
        }
    );
    return data;
}
export async function createBookingMultiCityHold(payload: ResellerBookingCheckoutMultiCity) {
    const { data } = await apiClient.post<ResellerBookingResponse>(
        "/api/reseller/bookings/multi-city",
        payload.checkout
    );
    return data;
}

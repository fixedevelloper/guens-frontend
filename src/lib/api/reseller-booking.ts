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
    bookingId: string;
    status: string;
    providerConfirmationNumber: string | null;
    ticketingDeadline: string | null;
    amountDue: number;
    currency: string;
}
export interface ResellerTicketResponse {
    bookingId: string;
    status: string;
    pnrCode: string | null;
    eTicketNumbers: string[];
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

export async function payBooking(
    bookingId: string,
    payload: { paymentMethod: string; payerReference: string }
) {
    const { data } = await apiClient.post<ResellerBookingResponse>(
        `/api/reseller/bookings/${bookingId}/pay`,
        payload
    );
    return data;
}

export async function getBookingStatus(bookingId: string) {
    const { data } = await apiClient.get<ResellerTicketResponse>(
        `/api/reseller/bookings/${bookingId}`
    );
    return data;
}
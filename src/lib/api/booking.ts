import { apiClient } from "./client";
import { getRememberedContactEmail, rememberContactEmail } from "@/lib/booking-contact";
import type { BookingResponse, CheckoutRequest, MultiCityCheckoutRequest } from "./types";

export async function checkout(request: CheckoutRequest) {
  const { data } = await apiClient.post<BookingResponse>("/api/bookings/checkout", request);
  rememberContactEmail(data.contactEmail);
  return data;
}

export async function checkoutMultiCity(request: MultiCityCheckoutRequest) {
  const { data } = await apiClient.post<BookingResponse>("/api/bookings/checkout/multi-city", request);
  rememberContactEmail(data.contactEmail);
  return data;
}

export async function getBooking(bookingId: string) {
  const { data } = await apiClient.get<BookingResponse>(`/api/bookings/${bookingId}`, {
    params: { email: getRememberedContactEmail() ?? undefined },
  });
  return data;
}

/** Every booking made by the signed-in account - backs the customer dashboard. */
export async function getMyBookings() {
  const { data } = await apiClient.get<BookingResponse[]>("/api/bookings/me");
  return data;
}

export async function cancelBooking(bookingId: string) {
  const { data } = await apiClient.post<BookingResponse>(`/api/bookings/${bookingId}/cancel`, null, {
    params: { email: getRememberedContactEmail() ?? undefined },
  });
  return data;
}

/** Base URL for the SSE tracking stream - consumed directly with EventSource, not axios. */
export function bookingTrackUrl(bookingId: string) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  const email = getRememberedContactEmail();
  const query = email ? `?email=${encodeURIComponent(email)}` : "";
  return `${base}/api/bookings/${bookingId}/track${query}`;
}

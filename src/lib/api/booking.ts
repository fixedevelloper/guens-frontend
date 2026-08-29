import { apiClient } from "./client";
import { getRememberedContactEmail, rememberContactEmail } from "@/lib/booking-contact";
import type {
  AncillaryOptionResponse,
  AncillaryOptionsRequest,
  BookingResponse,
  CheckoutRequest,
  FlightOrderDetail,
  MultiCityCheckoutRequest,
} from "./types";

/** Quotes priced extras (baggage/meal/seat/insurance) for the "additional options" checkout step. */
export async function getAncillaryOptions(request: AncillaryOptionsRequest) {
  const { data } = await apiClient.post<AncillaryOptionResponse[]>("/api/bookings/ancillary-options", request);
  return data;
}

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

/** Resubmits the provider hold for a FAILED booking that never got a provider confirmation. */
export async function retryBooking(bookingId: string) {
  const { data } = await apiClient.post<BookingResponse>(`/api/bookings/${bookingId}/retry`, null, {
    params: { email: getRememberedContactEmail() ?? undefined },
  });
  return data;
}

/** Live baggage/meals/seats/cancellation-policy detail for a confirmed flight booking, straight
 *  from the provider - null when unavailable (not a flight, not provider-confirmed yet, or the
 *  provider doesn't support this). The booking page falls back to what's already on the booking. */
export async function getFlightOrderDetail(bookingId: string) {
  const { data } = await apiClient.get<FlightOrderDetail | null>(`/api/bookings/${bookingId}/flight-order-detail`, {
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

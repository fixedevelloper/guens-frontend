import { apiClient } from "./client";
import { getRememberedContactEmail } from "@/lib/booking-contact";
import type { ETicket } from "./types";

export async function getTicketsForBooking(bookingId: string) {
  const { data } = await apiClient.get<ETicket[]>(`/api/tickets/booking/${bookingId}`, {
    params: { email: getRememberedContactEmail() ?? undefined },
  });
  return data;
}

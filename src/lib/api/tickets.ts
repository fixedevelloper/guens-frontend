import { apiClient } from "./client";
import { getRememberedContactEmail } from "@/lib/booking-contact";
import type { ETicket } from "./types";

export async function getTicketsForBooking(bookingId: string) {
  const { data } = await apiClient.get<ETicket[]>(`/api/tickets/booking/${bookingId}`, {
    params: { email: getRememberedContactEmail() ?? undefined },
  });
  return data;
}

/**
 * requesterEmail proves ownership of the booking (same guest-access rule as getTicketsForBooking)
 * - the remembered contact email, exactly like the GET above. recipientEmail is optional; the
 * backend defaults it to the booking's own contact email when omitted.
 */
export async function sendTicketByEmail(ticketId: string, recipientEmail?: string) {
  await apiClient.post(`/api/tickets/${ticketId}/email`, {
    requesterEmail: getRememberedContactEmail(),
    recipientEmail: recipientEmail || undefined,
  });
}

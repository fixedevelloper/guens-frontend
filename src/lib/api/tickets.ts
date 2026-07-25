import { apiClient } from "./client";
import type { ETicket } from "./types";

export async function getTicketsForBooking(bookingId: string) {
  const { data } = await apiClient.get<ETicket[]>(`/api/tickets/booking/${bookingId}`);
  return data;
}

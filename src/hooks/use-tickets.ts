import { useMutation, useQuery } from "@tanstack/react-query";

import { getTicketsForBooking, sendTicketByEmail } from "@/lib/api/tickets";

/**
 * Ticket rows are written asynchronously right after the booking flips to CONFIRMED (a Spring
 * Modulith event listener, not the same transaction) - the frontend can start querying a beat
 * before they exist. Poll briefly until they show up instead of leaving the user stuck on "no
 * tickets yet" until they manually reload.
 */
export function useTicketsQuery(bookingId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ["tickets", bookingId],
    queryFn: () => getTicketsForBooking(bookingId as string),
    enabled: enabled && bookingId !== null,
    refetchInterval: (query) => (query.state.data && query.state.data.length > 0 ? false : 2000),
  });
}

export function useSendTicketByEmailMutation() {
  return useMutation({
    mutationFn: ({ ticketId, recipientEmail }: { ticketId: string; recipientEmail?: string }) =>
      sendTicketByEmail(ticketId, recipientEmail),
  });
}

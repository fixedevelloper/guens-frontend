import { useQuery } from "@tanstack/react-query";

import { getTicketsForBooking } from "@/lib/api/tickets";

export function useTicketsQuery(bookingId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ["tickets", bookingId],
    queryFn: () => getTicketsForBooking(bookingId as string),
    enabled: enabled && bookingId !== null,
  });
}

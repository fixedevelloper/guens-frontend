import { useEffect, useState } from "react";

import { bookingTrackUrl } from "@/lib/api/booking";
import type { BookingStatus } from "@/lib/api/types";

const TERMINAL_STATUSES: BookingStatus[] = ["CONFIRMED", "FAILED", "CANCELLED"];

/**
 * Subscribes to GET /api/bookings/{id}/track (Server-Sent Events) and returns the latest
 * status pushed live by the backend, without polling. Starts at `undefined` rather than
 * seeding from the last REST fetch: if the provider confirmation already finished before
 * this component subscribed (common in mock mode, where it's near-instant), the backend
 * has nothing left to replay and no event ever arrives - callers should fall back to their
 * own REST-fetched status in that case rather than trust a stale seed here forever.
 */
export function useBookingTracking(bookingId: string | null) {
  const [liveStatus, setLiveStatus] = useState<BookingStatus | undefined>(undefined);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    if (!bookingId) return;

    const source = new EventSource(bookingTrackUrl(bookingId));
    setConnectionError(false);

    source.addEventListener("status", (event: MessageEvent<string>) => {
      try {
        const next = JSON.parse(event.data) as BookingStatus;
        setLiveStatus(next);
        if (TERMINAL_STATUSES.includes(next)) {
          source.close();
        }
      } catch {
        // ignore malformed frames
      }
    });

    source.onerror = () => {
      setConnectionError(true);
    };

    return () => {
      source.close();
    };
  }, [bookingId]);

  return {
    liveStatus,
    connectionError,
    isTerminal: liveStatus ? TERMINAL_STATUSES.includes(liveStatus) : false,
  };
}

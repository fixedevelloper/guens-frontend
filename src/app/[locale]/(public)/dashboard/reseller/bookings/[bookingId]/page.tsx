"use client";

import { useParams } from "next/navigation";

import { BookingTrackingContent } from "@/components/tracking/booking-tracking-content";

export default function ResellerBookingTrackingPage() {
  const params = useParams<{ bookingId: string }>();
  const bookingId = params.bookingId;

  return (
      <BookingTrackingContent
          bookingId={bookingId}
          paymentPath={(id) => `/dashboard/reseller/payment/${id}`}
          flightDetailsPath={(id) => `/bookings/${id}/flight`}
          accountPath="/dashboard/reseller/overlays"
          searchAgainPath="/dashboard/reseller/overlays"
      />
  );
}

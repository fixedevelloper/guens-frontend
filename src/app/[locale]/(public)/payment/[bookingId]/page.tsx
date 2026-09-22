"use client";

import { useParams } from "next/navigation";

import { PaymentPageContent } from "@/components/checkout/payment-page-content";

export default function PaymentPage() {
  const params = useParams<{ bookingId: string }>();
  const bookingId = params.bookingId;

  return (
      <PaymentPageContent
          bookingId={bookingId}
          trackingPath={(id) => `/bookings/${id}`}
          notFoundPath="/dashboard"
      />
  );
}

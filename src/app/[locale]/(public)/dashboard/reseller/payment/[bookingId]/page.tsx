"use client";

import { useParams } from "next/navigation";

import { PaymentPageContent } from "@/components/checkout/payment-page-content";

export default function ResellerPaymentPage() {
  const params = useParams<{ bookingId: string }>();
  const bookingId = params.bookingId;

  return (
      <PaymentPageContent
          bookingId={bookingId}
          trackingPath={(id) => `/dashboard/reseller/bookings/${id}`}
          notFoundPath="/dashboard/reseller/overlays"
      />
  );
}

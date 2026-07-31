import { apiClient } from "./client";
import { getRememberedContactEmail } from "@/lib/booking-contact";
import type { BookingPaymentRequest, PaymentResponse } from "./types";

export async function pay(request: BookingPaymentRequest) {
  const { data } = await apiClient.post<PaymentResponse>("/api/payments", request);
  return data;
}

export async function getPayment(paymentId: string) {
  const { data } = await apiClient.get<PaymentResponse>(`/api/payments/${paymentId}`, {
    params: { email: getRememberedContactEmail() ?? undefined },
  });
  return data;
}

export async function completeCardAuthorization(paymentId: string, pin: string) {
  const { data } = await apiClient.post<PaymentResponse>(
      `/api/payments/${paymentId}/card-authorization`,
      { pin }
  );
  return data;
}

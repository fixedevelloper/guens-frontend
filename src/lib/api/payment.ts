import { apiClient } from "./client";
import type { PaymentRequest, PaymentResponse } from "./types";

export async function pay(request: PaymentRequest) {
  const { data } = await apiClient.post<PaymentResponse>("/api/payments", request);
  return data;
}

export async function getPayment(paymentId: string) {
  const { data } = await apiClient.get<PaymentResponse>(`/api/payments/${paymentId}`);
  return data;
}

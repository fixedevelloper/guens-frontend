import { apiClient } from "./client";
import { getRememberedContactEmail } from "@/lib/booking-contact";
import type { BookingPaymentRequest, ManualPaymentInfoResponse, PaymentResponse } from "./types";

export async function pay(request: BookingPaymentRequest) {
  const { data } = await apiClient.post<PaymentResponse>("/api/payments", request);
  return data;
}

/** Whether countryCode is currently in manual/agent-confirmed payment mode, and if so, which
 *  merchant codes to show instead of the normal card/mobile-money form - see PaymentForm. */
export async function getManualPaymentInfo(countryCode: string) {
  const { data } = await apiClient.get<ManualPaymentInfoResponse>("/api/payments/manual-info", {
    params: { countryCode },
  });
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

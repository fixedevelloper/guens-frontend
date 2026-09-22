import { apiClient } from "./client";
import type { AgentPaymentDetailResponse, AgentPendingPaymentResponse } from "./types";

/** Manual payments awaiting confirmation - see AgentPaymentController/ManualPaymentGateway. */
export async function getPendingManualPayments() {
  const { data } = await apiClient.get<AgentPendingPaymentResponse[]>("/api/agent/payments/pending");
  return data;
}

/** Manual payments the current agent has personally confirmed - the "confirmé par moi" history. */
export async function getConfirmedManualPayments() {
  const { data } = await apiClient.get<AgentPendingPaymentResponse[]>("/api/agent/payments/confirmed");
  return data;
}

/** Full detail (payment + entire reservation) for one manual payment, any status. */
export async function getManualPaymentDetail(paymentId: string) {
  const { data } = await apiClient.get<AgentPaymentDetailResponse>(`/api/agent/payments/${paymentId}`);
  return data;
}

export async function confirmManualPayment(paymentId: string) {
  await apiClient.post(`/api/agent/payments/${paymentId}/confirm`, {});
}

export async function rejectManualPayment(paymentId: string, reason: string) {
  await apiClient.post(`/api/agent/payments/${paymentId}/reject`, { reason });
}

import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

import * as paymentApi from "@/lib/api/payment";
import type { BookingPaymentRequest, PaymentResponse } from "@/lib/api/types"; // Suppose qu'il existe un PaymentResponse

export function usePaymentMutation(
    options?: UseMutationOptions<PaymentResponse, Error, BookingPaymentRequest>
) {
  return useMutation({
    mutationFn: (request: BookingPaymentRequest) => paymentApi.pay(request),
    ...options,
  });
}

export function useCardAuthorizationMutation(
    options?: UseMutationOptions<PaymentResponse, Error, { paymentId: string; pin: string }>
) {
  return useMutation({
    mutationFn: ({ paymentId, pin }) => paymentApi.completeCardAuthorization(paymentId, pin),
    ...options,
  });
}
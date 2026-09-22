import { useMutation, useQuery, type UseMutationOptions } from "@tanstack/react-query";

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

/** Whether `countryCode` is currently routed to manual/agent-confirmed payment, and its merchant
 *  codes if so - see PaymentForm. Disabled until a 2-letter country is actually picked. */
export function useManualPaymentInfoQuery(countryCode: string | undefined) {
  return useQuery({
    queryKey: ["manual-payment-info", countryCode],
    queryFn: () => paymentApi.getManualPaymentInfo(countryCode as string),
    enabled: Boolean(countryCode && countryCode.length === 2),
    staleTime: 60_000,
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
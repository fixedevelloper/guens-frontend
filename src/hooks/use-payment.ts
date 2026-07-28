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
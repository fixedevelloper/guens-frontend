import { useMutation } from "@tanstack/react-query";

import * as paymentApi from "@/lib/api/payment";
import type { PaymentRequest } from "@/lib/api/types";

export function usePaymentMutation() {
  return useMutation({
    mutationFn: (request: PaymentRequest) => paymentApi.pay(request),
  });
}

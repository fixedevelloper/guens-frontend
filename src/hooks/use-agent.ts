import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as agentApi from "@/lib/api/agent";

export function usePendingManualPaymentsQuery() {
  return useQuery({
    queryKey: ["agent-pending-payments"],
    queryFn: () => agentApi.getPendingManualPayments(),
    // An agent's queue changes as customers pay - keep it reasonably fresh without a manual
    // refresh button being the only way to see a newly submitted reference.
    refetchInterval: 30_000,
  });
}

/** "Confirmé par moi" history - every manual payment this agent has personally validated. */
export function useConfirmedManualPaymentsQuery() {
  return useQuery({
    queryKey: ["agent-confirmed-payments"],
    queryFn: () => agentApi.getConfirmedManualPayments(),
  });
}

export function useManualPaymentDetailQuery(paymentId: string | null) {
  return useQuery({
    queryKey: ["agent-payment-detail", paymentId],
    queryFn: () => agentApi.getManualPaymentDetail(paymentId as string),
    enabled: paymentId !== null,
  });
}

export function useConfirmManualPaymentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: string) => agentApi.confirmManualPayment(paymentId),
    onSuccess: (_data, paymentId) => {
      queryClient.invalidateQueries({ queryKey: ["agent-pending-payments"] });
      queryClient.invalidateQueries({ queryKey: ["agent-confirmed-payments"] });
      queryClient.invalidateQueries({ queryKey: ["agent-payment-detail", paymentId] });
    },
  });
}

export function useRejectManualPaymentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, reason }: { paymentId: string; reason: string }) =>
      agentApi.rejectManualPayment(paymentId, reason),
    onSuccess: (_data, { paymentId }) => {
      queryClient.invalidateQueries({ queryKey: ["agent-pending-payments"] });
      queryClient.invalidateQueries({ queryKey: ["agent-payment-detail", paymentId] });
    },
  });
}

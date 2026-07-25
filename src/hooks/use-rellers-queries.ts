import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as resellerApi from "@/lib/api/reseller";
import { ResellerFormData } from "@/lib/api/types";

export function useCreateResellerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ResellerFormData) => resellerApi.createReseller(payload),
    onSuccess: () => {
      // Invalide le cache des revendeurs pour rafraîchir la liste
      queryClient.invalidateQueries({
        queryKey: ["resellers"],
      });
    },
  });
}
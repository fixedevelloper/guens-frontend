import { useQuery } from "@tanstack/react-query";

import * as destinationsApi from "@/lib/api/destinations";

export function useFeaturedDestinationsQuery() {
  return useQuery({
    queryKey: ["featured-destinations"],
    queryFn: () => destinationsApi.getFeaturedDestinations(),
    staleTime: 5 * 60 * 1000,
  });
}

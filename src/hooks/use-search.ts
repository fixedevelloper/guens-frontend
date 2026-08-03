import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import {
  getFlightSeatMap, searchFlights, searchHotels, searchMultiCityFlights, getHotelDeatils, getHotelRooms,
  searchVehicles, searchProperties, loadMoreHotels
} from "@/lib/api/search";
import type {
  FlightSearchParams,
  HarmonizedHotelOffer,
  HotelSearchParams,
  MultiCityFlightSearchParams, PropertySearchParams,
  VehicleSearchParams
} from "@/lib/api/types";


export function useVehicleSearch(params: VehicleSearchParams | null) {
  return useQuery({
    queryKey: ["vehicles", params],
    queryFn: () => searchVehicles(params as VehicleSearchParams),
    enabled: params !== null,
  });
}
export function usePropertySearch(params: PropertySearchParams | null) {
  return useQuery({
    queryKey: ["properties", params],
    queryFn: () => searchProperties(params as PropertySearchParams),
    enabled: params !== null,
  });
}
export function useFlightSearch(params: FlightSearchParams | null) {
  return useQuery({
    queryKey: ["flights", params],
    queryFn: () => searchFlights(params as FlightSearchParams),
    enabled: params !== null,
  });
}

export function useMultiCityFlightSearch(params: MultiCityFlightSearchParams | null) {
  return useQuery({
    queryKey: ["flights-multi-city", params],
    queryFn: () => searchMultiCityFlights(params as MultiCityFlightSearchParams),
    enabled: params !== null,
  });
}

export function useHotelSearch(params: HotelSearchParams | null) {
  return useQuery({
    queryKey: ["hotels", params],
    queryFn: () => searchHotels(params as HotelSearchParams),
    enabled: params !== null,
  });
}

/**
 * Wraps {@link useHotelSearch} with "load more" pagination: keeps every page's offers
 * accumulated in `offers`, resetting back to just page 1 whenever the search params change (a
 * genuinely new search). `hasMore` is false either when no provider captured a pagination token
 * for this search (see HotelSearchResult.searchId) or once a load-more call has come back empty.
 */
export function useHotelSearchWithLoadMore(params: HotelSearchParams | null) {
  const query = useHotelSearch(params);
  const [offers, setOffers] = useState<HarmonizedHotelOffer[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setOffers(query.data?.offers ?? []);
    setPageNumber(1);
    setHasMore(Boolean(query.data?.searchId));
    // Only a genuinely new query.data reference (a new search) should reset accumulated pages.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data]);

  const loadMoreMutation = useMutation({
    mutationFn: (nextPage: number) => loadMoreHotels(query.data!.searchId!, nextPage),
    onSuccess: (newOffers, nextPage) => {
      setPageNumber(nextPage);
      if (newOffers.length === 0) {
        setHasMore(false);
      } else {
        setOffers((previous) => [...previous, ...newOffers]);
      }
    },
  });

  function loadMore() {
    if (!query.data?.searchId || loadMoreMutation.isPending) return;
    loadMoreMutation.mutate(pageNumber + 1);
  }

  return {
    ...query,
    offers,
    loadMore,
    isLoadingMore: loadMoreMutation.isPending,
    hasMore,
  };
}

export function useFlightSeatMap(offerId: string | null) {
  return useQuery({
    queryKey: ["flight-seat-map", offerId],
    queryFn: () => getFlightSeatMap(offerId as string),
    enabled: offerId !== null,
    staleTime: Infinity,
  });
}

export function useHotelDetail(offerId: string | null | undefined) {
  return useQuery({
    queryKey: ["hotel-detail", offerId],
    queryFn: () => getHotelDeatils(offerId!),
    // 1. Accepte null, undefined et les chaînes vides ""
    enabled: Boolean(offerId),
    // 2. Durée de validité des données (ex: 10 min)
    staleTime: 10 * 60 * 1000, 
    // 3. Ne PAS retenter en cas d'offre expirée (404 / 410)
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 404 || status === 410) return false;
      return failureCount < 2;
    },
  });
}
export function useHotelRooms(offerId: string | null) {
  return useQuery({
    queryKey: ["hotel-rooms", offerId],
    queryFn: () => getHotelRooms(offerId as string),
    enabled: offerId !== null,
    staleTime: Infinity,
  });
}
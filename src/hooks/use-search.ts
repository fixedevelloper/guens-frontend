import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";

import {
  flightSearchStreamUrl, getFlightSeatMap, searchFlights, searchHotels, searchMultiCityFlights, getHotelDeatils,
  getHotelRooms, searchVehicles, searchProperties, loadMoreHotels
} from "@/lib/api/search";
import type {
  FlightSearchParams,
  HarmonizedFlightOffer,
  HarmonizedHotelOffer,
  HotelSearchParams,
  MultiCityFlightSearchParams, PropertySearchParams,
  ProviderOffersEvent,
  VehicleSearchParams
} from "@/lib/api/types";


export function useVehicleSearch(params: VehicleSearchParams | null) {
  return useQuery({
    queryKey: ["vehicles", params],
    queryFn: ({ signal }) => searchVehicles(params as VehicleSearchParams, signal),
    enabled: params !== null,
  });
}
export function usePropertySearch(params: PropertySearchParams | null) {
  return useQuery({
    queryKey: ["properties", params],
    queryFn: ({ signal }) => searchProperties(params as PropertySearchParams, signal),
    enabled: params !== null,
  });
}
export function useFlightSearch(params: FlightSearchParams | null) {
  return useQuery({
    queryKey: ["flights", params],
    queryFn: ({ signal }) => searchFlights(params as FlightSearchParams, signal),
    enabled: params !== null,
  });
}

/**
 * SSE counterpart of {@link useFlightSearch}: subscribes to GET /api/search/flights/stream so
 * `offers` fills in progressively as each provider answers, instead of waiting for the slowest
 * one (or the fan-out timeout) before showing anything. `offers` accumulates each provider's own
 * `provider-offers` batch as it arrives, then gets replaced wholesale by the final,
 * fully cross-provider-harmonized list once `search-completed` arrives - a provider's own
 * incremental batch can't merge the same physical flight quoted by a different provider into one
 * multi-quote entry the way the final list can (see ProviderOffersEvent).
 */
export function useFlightSearchStream(params: FlightSearchParams | null) {
  const [offers, setOffers] = useState<HarmonizedFlightOffer[]>([]);
  // Lazily seeded from whether there's actually a search to run, so a caller that renders with
  // non-null params from the very first paint doesn't flash an empty/idle state for one frame
  // before the effect below flips this to true itself.
  const [isSearching, setIsSearching] = useState(() => params !== null);
  const [error, setError] = useState<string | null>(null);
  // Bumped by retry() to force the effect below to reopen the stream without any other input
  // changing - EventSource has no built-in retry-on-demand the way React Query's refetch() does.
  const [retryKey, setRetryKey] = useState(0);

  // Keying the effect off the resulting URL string (not `params` itself) means an unstable
  // `params` object reference from the caller doesn't reopen the stream unless its actual content
  // changed - the same effect useFlightSearch gets for free from React Query's queryKey hashing.
  const streamUrl = useMemo(() => (params === null ? null : flightSearchStreamUrl(params)), [params]);

  useEffect(() => {
    if (streamUrl === null) {
      setOffers([]);
      setIsSearching(false);
      setError(null);
      return;
    }

    setOffers([]);
    setIsSearching(true);
    setError(null);
    const source = new EventSource(streamUrl, { withCredentials: true });

    source.addEventListener("provider-offers", (event: MessageEvent<string>) => {
      try {
        const { offers: providerOffers } = JSON.parse(event.data) as ProviderOffersEvent;
        setOffers((previous) => [...previous, ...providerOffers]);
      } catch {
        // ignore malformed frames
      }
    });

    source.addEventListener("search-completed", (event: MessageEvent<string>) => {
      try {
        setOffers(JSON.parse(event.data) as HarmonizedFlightOffer[]);
      } catch {
        // ignore malformed frames - keep whatever was accumulated from provider-offers instead
      } finally {
        setIsSearching(false);
        source.close();
      }
    });

    source.addEventListener("search-failed", (event: MessageEvent<string>) => {
      let message = "La recherche a échoué.";
      try {
        message = (JSON.parse(event.data) as { message?: string }).message ?? message;
      } catch {
        // keep the default message
      }
      setError(message);
      setIsSearching(false);
      source.close();
    });

    // EventSource retries transient network hiccups on its own; only a genuinely closed
    // connection (readyState CLOSED) means this search is really over.
    source.onerror = () => {
      if (source.readyState === EventSource.CLOSED) {
        setIsSearching(false);
      }
    };

    return () => {
      source.close();
    };
  }, [streamUrl, retryKey]);

  const retry = useCallback(() => setRetryKey((key) => key + 1), []);

  return { offers, isSearching, error, retry };
}

export function useMultiCityFlightSearch(params: MultiCityFlightSearchParams | null) {
  return useQuery({
    queryKey: ["flights-multi-city", params],
    queryFn: ({ signal }) => searchMultiCityFlights(params as MultiCityFlightSearchParams, signal),
    enabled: params !== null,
  });
}

export function useHotelSearch(params: HotelSearchParams | null) {
  return useQuery({
    queryKey: ["hotels", params],
    queryFn: ({ signal }) => searchHotels(params as HotelSearchParams, signal),
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
    retry: (failureCount, error) => {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
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
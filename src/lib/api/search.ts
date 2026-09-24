import { apiClient } from "./client";
import type {
  FlightSearchParams,
  HarmonizedFlightOffer,
  HarmonizedHotelOffer, HarmonizedPropertyOffer, HarmonizedVehicleOffer, HotelDetail,
  HotelSearchParams,
  HotelSearchResult,
  MultiCityFlightSearchParams,
  MultiCityItinerary, PropertySearchParams,
  RoomOffer,
  SeatMapResponse, VehicleSearchParams, FlightFareRules,
} from "./types";

// Must stay above the backend's own provider fan-out budget
// (app.search.flight-provider-timeout-millis / FLIGHT_SEARCH_PROVIDER_TIMEOUT_MILLIS, see
// FlightSearchService) plus headroom for network + serialization, or this fires first and aborts
// a search the backend was still legitimately working on - which is exactly what happened here:
// this was 15s (matching a backend budget of 12s at the time), the backend budget was since
// raised to 52s (.env) without updating this constant to match, so every search that took the
// backend more than 15s got aborted client-side, retried once (see QueryProvider's global
// `retry: 1`), and aborted again - two cancelled requests, no result, for a search the backend
// would have answered within its own 52s budget. 60s covers the current 52s backend budget with
// margin; if that budget changes again, this needs to move with it.
const FLIGHT_SEARCH_TIMEOUT_MS = 60_000;

export async function searchFlights(params: FlightSearchParams, signal?: AbortSignal) {
  const { data } = await apiClient.get<HarmonizedFlightOffer[]>("/api/search/flights", {
    params,
    timeout: FLIGHT_SEARCH_TIMEOUT_MS,
    signal,
  });
  return data;
}

/** Base URL for the SSE flight-search stream (see SearchController#searchFlightsStream) -
 *  consumed directly with EventSource, not axios, so params are serialized manually here
 *  (undefined fields dropped, matching what axios's own `params` serialization already does
 *  for the plain {@link searchFlights} call above). */
export function flightSearchStreamUrl(params: FlightSearchParams) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      query.set(key, String(value));
    }
  }
  return `${base}/api/search/flights/stream?${query.toString()}`;
}

export async function searchMultiCityFlights(params: MultiCityFlightSearchParams, signal?: AbortSignal) {
  const { data } = await apiClient.post<MultiCityItinerary[]>("/api/search/flights/multi-city", params, { signal });
  return data;
}

export async function searchHotels(params: HotelSearchParams, signal?: AbortSignal) {
  const { data } = await apiClient.get<HotelSearchResult>("/api/search/hotels", { params, signal });
  return data;
}

/** Fetches an additional page of an already-run hotel search (see {@link HotelSearchResult.searchId}). */
export async function loadMoreHotels(searchId: string, pageNumber: number) {
  const { data } = await apiClient.get<HarmonizedHotelOffer[]>("/api/search/hotels/load-more", {
    params: { searchId, pageNumber },
  });
  return data;
}

/** Cancellation/change conditions of a searched flight; null when the provider has none (204). */
export async function getFlightFareRules(offerId: string): Promise<FlightFareRules | null> {
  const response = await apiClient.get<FlightFareRules>("/api/search/flights/fare-rules", { params: { offerId } });
  return response.status === 204 || !response.data ? null : response.data;
}

export async function getFlightSeatMap(offerId: string) {
  const { data } = await apiClient.get<SeatMapResponse>("/api/search/flights/seats", { params: { offerId } });
  return data;
}
export async function getHotelDeatils(offerId: string) {
  const { data } = await apiClient.get<HotelDetail>("/api/search/hotels/details", { params: { offerId } });
  return data;
}
export async function getHotelRooms(offerId: string) {
  const { data } = await apiClient.get<RoomOffer[]>("/api/search/hotels/get-rooms", { params: { offerId } });
  return data;
}


export async function searchVehicles(params: VehicleSearchParams, signal?: AbortSignal) {
  const { data } = await apiClient.get<HarmonizedVehicleOffer[]>("/api/search/vehicles", { params, signal });
  return data;
}
// Ajout dans hooks/use-search.ts, sur exactement le modèle de useVehicleSearch

export async function searchProperties(params: PropertySearchParams, signal?: AbortSignal) {
  const { data } = await apiClient.get<HarmonizedPropertyOffer[]>("/api/search/properties", { params, signal });
  return data;
}


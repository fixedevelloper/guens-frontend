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
  SeatMapResponse, VehicleSearchParams,
} from "./types";
import {useQuery} from "@tanstack/react-query";

// The page must show results (or a clear failure) within a 15s budget. The backend already
// caps its own slowest step - the provider fan-out - at 12s (app.search.flight-provider-timeout-millis,
// see FlightSearchService), leaving headroom for network + serialization. This per-call timeout
// overrides the apiClient's generic 45s default (sized for the slowest endpoint in the app) so a
// flight search that misses its own budget fails fast instead of leaving the loader spinning past
// the point where the page is supposed to have an answer.
const FLIGHT_SEARCH_TIMEOUT_MS = 15_000;

export async function searchFlights(params: FlightSearchParams) {
  const { data } = await apiClient.get<HarmonizedFlightOffer[]>("/api/search/flights", {
    params,
    timeout: FLIGHT_SEARCH_TIMEOUT_MS,
  });
  return data;
}

export async function searchMultiCityFlights(params: MultiCityFlightSearchParams) {
  const { data } = await apiClient.post<MultiCityItinerary[]>("/api/search/flights/multi-city", params);
  return data;
}

export async function searchHotels(params: HotelSearchParams) {
  const { data } = await apiClient.get<HotelSearchResult>("/api/search/hotels", { params });
  return data;
}

/** Fetches an additional page of an already-run hotel search (see {@link HotelSearchResult.searchId}). */
export async function loadMoreHotels(searchId: string, pageNumber: number) {
  const { data } = await apiClient.get<HarmonizedHotelOffer[]>("/api/search/hotels/load-more", {
    params: { searchId, pageNumber },
  });
  return data;
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


export async function searchVehicles(params: VehicleSearchParams) {
  const { data } = await apiClient.get<HarmonizedVehicleOffer[]>("/api/search/vehicles", { params });
  return data;
}
// Ajout dans hooks/use-search.ts, sur exactement le modèle de useVehicleSearch

export async function searchProperties(params: PropertySearchParams) {
  const { data } = await apiClient.get<HarmonizedPropertyOffer[]>("/api/search/properties", { params });
  return data;
}


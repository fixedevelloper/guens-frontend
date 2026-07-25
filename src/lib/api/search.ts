import { apiClient } from "./client";
import type {
  FlightSearchParams,
  HarmonizedFlightOffer,
  HarmonizedHotelOffer, HotelDetail,
  HotelSearchParams,
  MultiCityFlightSearchParams,
  MultiCityItinerary,
  RoomOffer,
  SeatMapResponse,
} from "./types";

export async function searchFlights(params: FlightSearchParams) {
  const { data } = await apiClient.get<HarmonizedFlightOffer[]>("/api/search/flights", { params });
  return data;
}

export async function searchMultiCityFlights(params: MultiCityFlightSearchParams) {
  const { data } = await apiClient.post<MultiCityItinerary[]>("/api/search/flights/multi-city", params);
  return data;
}

export async function searchHotels(params: HotelSearchParams) {
  const { data } = await apiClient.get<HarmonizedHotelOffer[]>("/api/search/hotels", { params });
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
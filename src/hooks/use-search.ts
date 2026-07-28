import { useQuery } from "@tanstack/react-query";

import {
  getFlightSeatMap, searchFlights, searchHotels, searchMultiCityFlights, getHotelDeatils, getHotelRooms,
  searchVehicles, searchProperties
} from "@/lib/api/search";
import type {
  FlightSearchParams,
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
  console.log(params)
  return useQuery({
    queryKey: ["hotels", params],
    queryFn: () => searchHotels(params as HotelSearchParams),
    enabled: params !== null,
  });
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
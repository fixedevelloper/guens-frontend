import { apiClient } from "./client";
import type { AirportOption, HotelCityOption } from "./types";

export interface LocationOption {
  code: string;
  title: string;
  subtitle: string;
}

export async function searchAirportSuggestions(query: string, limit = 8): Promise<LocationOption[]> {
  const { data } = await apiClient.get<AirportOption[]>("/api/geo/airports", {
    params: { q: query, limit },
  });
  return data.map((airport) => ({
    code: airport.airportCode,
    title: `${airport.city} (${airport.airportCode})`,
    subtitle: `${airport.airportName} · ${airport.country}`,
  }));
}

export async function searchCitySuggestions(query: string, limit = 8): Promise<LocationOption[]> {
  const { data } = await apiClient.get<HotelCityOption[]>("/api/geo/cities", {
    params: { q: query, limit },
  });
  return data.map((city) => ({
    code: city.cityName,
    title: city.cityName,
    subtitle: city.countryName,
  }));
}

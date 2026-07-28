import type {
  CabinClass,
  FlightLeg,
  FlightSearchParams,
  HotelSearchParams,
  JourneyType,
  MultiCityFlightSearchParams, VehicleSearchParams,
} from "@/lib/api/types";
import {CarSearchParams} from "@/components/search/car-rental-form";

export function parseFlightSearchParams(sp: URLSearchParams): FlightSearchParams | null {
  const origin = sp.get("origin");
  const destination = sp.get("destination");
  const departureDate = sp.get("departureDate");
  if (!origin || !destination || !departureDate) return null;

  return {
    origin,
    destination,
    departureDate,
    returnDate: sp.get("returnDate") ?? undefined,
    adults: sp.get("adults") ? Number(sp.get("adults")) : undefined,
    children: sp.get("children") ? Number(sp.get("children")) : undefined,
    infants: sp.get("infants") ? Number(sp.get("infants")) : undefined,
    journeyType: (sp.get("journeyType") as JourneyType | null) ?? undefined,
    cabinClass: (sp.get("cabinClass") as CabinClass | null) ?? undefined,
    currency: sp.get("currency") ?? undefined,
  };
}

export function flightSearchParamsToQuery(params: FlightSearchParams): string {
  const qs = new URLSearchParams();
  qs.set("origin", params.origin);
  qs.set("destination", params.destination);
  qs.set("departureDate", params.departureDate);
  if (params.returnDate) qs.set("returnDate", params.returnDate);
  if (params.adults) qs.set("adults", String(params.adults));
  if (params.children) qs.set("children", String(params.children));
  if (params.infants) qs.set("infants", String(params.infants));
  if (params.journeyType) qs.set("journeyType", params.journeyType);
  if (params.cabinClass) qs.set("cabinClass", params.cabinClass);
  if (params.currency) qs.set("currency", params.currency);
  return qs.toString();
}

export function parseMultiCitySearchParams(sp: URLSearchParams): MultiCityFlightSearchParams | null {
  const rawLegs = sp.get("legs");
  if (!rawLegs) return null;

  let legs: FlightLeg[];
  try {
    legs = JSON.parse(rawLegs);
  } catch {
    return null;
  }
  if (!Array.isArray(legs) || legs.length < 2) return null;

  return {
    legs,
    adults: sp.get("adults") ? Number(sp.get("adults")) : undefined,
    children: sp.get("children") ? Number(sp.get("children")) : undefined,
    infants: sp.get("infants") ? Number(sp.get("infants")) : undefined,
    cabinClass: (sp.get("cabinClass") as CabinClass | null) ?? undefined,
    currency: sp.get("currency") ?? undefined,
  };
}

export function multiCitySearchParamsToQuery(params: MultiCityFlightSearchParams): string {
  const qs = new URLSearchParams();
  qs.set("legs", JSON.stringify(params.legs));
  if (params.adults) qs.set("adults", String(params.adults));
  if (params.children) qs.set("children", String(params.children));
  if (params.infants) qs.set("infants", String(params.infants));
  if (params.cabinClass) qs.set("cabinClass", params.cabinClass);
  if (params.currency) qs.set("currency", params.currency);
  return qs.toString();
}

export function parseHotelSearchParams(sp: URLSearchParams): HotelSearchParams | null {
  const cityCode = sp.get("cityCode");
  const checkIn = sp.get("checkIn");
  const checkOut = sp.get("checkOut");
  if (!cityCode || !checkIn || !checkOut) return null;

  return {
    cityCode,
    checkIn,
    checkOut,
    adults: sp.get("adults") ? Number(sp.get("adults")) : undefined,
    rooms: sp.get("rooms") ? Number(sp.get("rooms")) : undefined,
   currency: sp.get("currency") || 'XAF',
  };
}

export function hotelSearchParamsToQuery(params: HotelSearchParams): string {
  const qs = new URLSearchParams();
  qs.set("cityCode", params.cityCode);
  qs.set("checkIn", params.checkIn);
  qs.set("checkOut", params.checkOut);
  if (params.adults) qs.set("adults", String(params.adults));
  if (params.rooms) qs.set("rooms", String(params.rooms));
  if (params.currency) qs.set("currency", params.currency);
  return qs.toString();
}

export function carSearchParamsToQuery(params: CarSearchParams): string {
  const q = new URLSearchParams({
    pickupCity: params.pickupLocation,
    rentalStart: params.pickupDate,
    pickupTime: params.pickupTime,
    rentalEnd: params.dropoffDate,
    dropoffTime: params.dropoffTime,
    withDriver: String(params.withDriver),
    driverAge25Plus: String(params.driverAge25Plus),
    currency: "XAF", // requis (@NotBlank) côté backend, absent du formulaire
  });
  if (params.differentDropoff && params.dropoffLocation) {
    q.set("dropoffCity", params.dropoffLocation);
  }
  return q.toString();
}

export function parseVehicleSearchParams(searchParams: URLSearchParams): VehicleSearchParams | null {
  const pickupCity = searchParams.get("pickupCity");
  const rentalStart = searchParams.get("rentalStart");
  const rentalEnd = searchParams.get("rentalEnd");
  if (!pickupCity || !rentalStart || !rentalEnd) return null;

  return {
    pickupCity,
    dropoffCity: searchParams.get("dropoffCity") ?? undefined,
    rentalStart,
    pickupTime: searchParams.get("pickupTime") ?? undefined,
    rentalEnd,
    dropoffTime: searchParams.get("dropoffTime") ?? undefined,
    withDriver: searchParams.get("withDriver") === "true",
    driverAge25Plus: searchParams.get("driverAge25Plus") !== "false",
    currency: searchParams.get("currency") ?? "XAF",
  };
}

import type { PropertySearchParams } from "@/lib/api/types";
import type { FurnishedRentalSearchParams } from "@/components/search/furnished-rental-form";

export function furnishedRentalSearchParamsToQuery(params: FurnishedRentalSearchParams): string {
  const q = new URLSearchParams({
    city: params.location,
    checkIn: params.checkInDate,
    checkOut: params.checkOutDate,
    guests: String(params.guests),
    entirePlace: String(params.entirePlace),
    currency: "XAF", // requis (@NotBlank) côté backend, absent du formulaire
  });
  if (params.bedrooms !== "any") {
    q.set("bedrooms", params.bedrooms);
  }
  if (params.propertyType !== "all") {
    q.set("propertyType", params.propertyType);
  }
  return q.toString();
}

export function parsePropertySearchParams(searchParams: URLSearchParams): PropertySearchParams | null {
  const city = searchParams.get("city");
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  if (!city || !checkIn || !checkOut) return null;

  const bedrooms = searchParams.get("bedrooms");

  return {
    city,
    checkIn,
    checkOut,
    guests: Number(searchParams.get("guests") ?? "1"),
    bedrooms: bedrooms ? Number(bedrooms) : undefined,
    propertyType: searchParams.get("propertyType") ?? undefined,
    entirePlace: searchParams.get("entirePlace") === "true",
    currency: searchParams.get("currency") ?? "XAF",
  };
}
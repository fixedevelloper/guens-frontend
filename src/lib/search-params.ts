import type {
  CabinClass,
  FlightLeg,
  FlightSearchParams,
  HotelSearchParams,
  JourneyType,
  MultiCityFlightSearchParams,
} from "@/lib/api/types";

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
    currency: sp.get("currency") ? sp.get("currency") : 'XAF',
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

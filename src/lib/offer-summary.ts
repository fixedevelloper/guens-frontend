import type { MultiCityItineraryLeg } from "@/lib/api/types";

export interface FlightOfferSummary {
  offerType: "FLIGHT";
  offerId: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  cabinClass: string;
  providerType: string;
  amount: string;
  currency: string;
}

export interface HotelOfferSummary {
  offerType: "HOTEL";
  offerId: string;
  hotelName: string;
  cityCode: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  providerType: string;
  amount: string;
  currency: string;
}

export interface MultiCityOfferSummary {
  offerType: "MULTI_CITY_FLIGHT";
  legs: MultiCityItineraryLeg[];
  providerType: string;
  amount: string;
  currency: string;
}

export type OfferSummary = FlightOfferSummary | HotelOfferSummary | MultiCityOfferSummary;

export function parseOfferSummary(sp: URLSearchParams): OfferSummary | null {
  const offerType = sp.get("offerType");

  if (offerType === "MULTI_CITY_FLIGHT") {
    const rawLegs = sp.get("legs");
    const providerType = sp.get("providerType");
    const amount = sp.get("amount");
    const currency = sp.get("currency");
    if (!rawLegs || !providerType || !amount || !currency) return null;
    try {
      const legs = JSON.parse(rawLegs) as MultiCityItineraryLeg[];
      if (!Array.isArray(legs) || legs.length === 0) return null;
      return { offerType: "MULTI_CITY_FLIGHT", legs, providerType, amount, currency };
    } catch {
      return null;
    }
  }

  const offerId = sp.get("offerId");
  const amount = sp.get("amount");
  const currency = sp.get("currency");
  const providerType = sp.get("providerType");
  if (!offerId || !amount || !currency || !providerType) return null;

  if (offerType === "FLIGHT") {
    const airline = sp.get("airline");
    const flightNumber = sp.get("flightNumber");
    const origin = sp.get("origin");
    const destination = sp.get("destination");
    const departureTime = sp.get("departureTime");
    const arrivalTime = sp.get("arrivalTime");
    const cabinClass = sp.get("cabinClass");
    if (!airline || !flightNumber || !origin || !destination || !departureTime || !arrivalTime) return null;
    return {
      offerType: "FLIGHT",
      offerId,
      airline,
      flightNumber,
      origin,
      destination,
      departureTime,
      arrivalTime,
      cabinClass: cabinClass ?? "ECONOMY",
      providerType,
      amount,
      currency,
    };
  }

  if (offerType === "HOTEL") {
    const hotelName = sp.get("hotelName");
    const cityCode = sp.get("cityCode");
    const roomType = sp.get("roomType");
    const checkIn = sp.get("checkIn");
    const checkOut = sp.get("checkOut");
    if (!hotelName || !cityCode || !roomType || !checkIn || !checkOut) return null;
    return {
      offerType: "HOTEL",
      offerId,
      hotelName,
      cityCode,
      roomType,
      checkIn,
      checkOut,
      providerType,
      amount,
      currency,
    };
  }

  return null;
}

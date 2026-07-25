import type { HarmonizedFlightOffer, HarmonizedHotelOffer, ProviderType } from "@/lib/api/types";

// --- Flights -----------------------------------------------------------

export interface FlightFilterState {
  maxPrice: number | null;
  providers: ProviderType[];
  airlines: string[];
}

export const DEFAULT_FLIGHT_FILTERS: FlightFilterState = {
  maxPrice: null,
  providers: [],
  airlines: [],
};

export interface FlightFilterOptions {
  minPrice: number;
  maxPrice: number;
  airlines: string[];
}

function cheapestQuotePrice(quotes: HarmonizedFlightOffer["quotes"]): number {
  return Math.min(...quotes.map((q) => Number(q.price.amount)));
}

export function computeFlightFilterOptions(offers: HarmonizedFlightOffer[]): FlightFilterOptions {
  if (offers.length === 0) {
    return { minPrice: 0, maxPrice: 0, airlines: [] };
  }
  const prices = offers.map((o) => cheapestQuotePrice(o.quotes));
  const airlines = Array.from(new Set(offers.map((o) => o.airline))).sort();
  return {
    minPrice: Math.floor(Math.min(...prices)),
    maxPrice: Math.ceil(Math.max(...prices)),
    airlines,
  };
}

/** Returns offers whose quotes have been narrowed to the selected providers, dropping any
 *  offer left with no matching quote or whose cheapest remaining quote exceeds maxPrice. */
export function filterFlightOffers(
  offers: HarmonizedFlightOffer[],
  filters: FlightFilterState
): HarmonizedFlightOffer[] {
  return offers
    .map((offer) => {
      const quotes = filters.providers.length
        ? offer.quotes.filter((q) => filters.providers.includes(q.providerType))
        : offer.quotes;
      return { ...offer, quotes };
    })
    .filter((offer) => {
      if (offer.quotes.length === 0) return false;
      if (filters.airlines.length && !filters.airlines.includes(offer.airline)) return false;
      if (filters.maxPrice != null && cheapestQuotePrice(offer.quotes) > filters.maxPrice) return false;
      return true;
    });
}

// --- Hotels --------------------------------------------------------------

export interface HotelFilterState {
  maxPrice: number | null;
  providers: ProviderType[];
  minRating: number;
  roomTypes: string[];
}

export const DEFAULT_HOTEL_FILTERS: HotelFilterState = {
  maxPrice: null,
  providers: [],
  minRating: 0,
  roomTypes: [],
};

export interface HotelFilterOptions {
  minPrice: number;
  maxPrice: number;
  roomTypes: string[];
}

export function computeHotelFilterOptions(offers: HarmonizedHotelOffer[]): HotelFilterOptions {
  if (offers.length === 0) {
    return { minPrice: 0, maxPrice: 0, roomTypes: [] };
  }
  const prices = offers.map((o) => cheapestQuotePrice(o.quotes));
  const roomTypes = Array.from(new Set(offers.map((o) => o.roomType))).sort();
  return {
    minPrice: Math.floor(Math.min(...prices)),
    maxPrice: Math.ceil(Math.max(...prices)),
    roomTypes,
  };
}

export function filterHotelOffers(
  offers: HarmonizedHotelOffer[],
  filters: HotelFilterState
): HarmonizedHotelOffer[] {
  return offers
    .map((offer) => {
      const quotes = filters.providers.length
        ? offer.quotes.filter((q) => filters.providers.includes(q.providerType))
        : offer.quotes;
      return { ...offer, quotes };
    })
    .filter((offer) => {
      if (offer.quotes.length === 0) return false;
      if (offer.rating < filters.minRating) return false;
      if (filters.roomTypes.length && !filters.roomTypes.includes(offer.roomType)) return false;
      if (filters.maxPrice != null && cheapestQuotePrice(offer.quotes) > filters.maxPrice) return false;
      return true;
    });
}

export function hotelOfferKey(offer: HarmonizedHotelOffer, index: number): string {
  return `${offer.hotelName}-${offer.roomType}-${index}`;
}

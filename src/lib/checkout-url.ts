import type { HarmonizedFlightOffer, HarmonizedHotelOffer, MultiCityItinerary, ProviderQuote } from "@/lib/api/types";

/**
 * The backend's checkout endpoint only needs an offerId + offerType (it resolves the rest
 * server-side from the OfferCache). Everything else here is denormalized purely so the
 * checkout page can render a summary without a "get offer by id" endpoint to call.
 */
export function checkoutUrlForFlight(offer: HarmonizedFlightOffer, offerId: string) {
  const quote = offer.quotes.find((q) => q.offerId === offerId) as ProviderQuote;
  const qs = new URLSearchParams({
    offerId,
    offerType: "FLIGHT",
    airline: offer.airline,
    flightNumber: offer.flightNumber,
    origin: offer.origin,
    destination: offer.destination,
    departureTime: offer.departureTime,
    arrivalTime: offer.arrivalTime,
    cabinClass: offer.cabinClass,
    providerType: quote.providerType,
    amount: String(quote.price.amount),
    currency: quote.price.currency,
  });
  return `/checkout?${qs.toString()}`;
}

export function checkoutUrlForMultiCityItinerary(itinerary: MultiCityItinerary) {
  const qs = new URLSearchParams({
    offerType: "MULTI_CITY_FLIGHT",
    legs: JSON.stringify(itinerary.legs),
    providerType: itinerary.providerType,
    amount: String(itinerary.totalPrice.amount),
    currency: itinerary.totalPrice.currency,
  });
  return `/checkout?${qs.toString()}`;
}

export function checkoutUrlForHotel(offer: HarmonizedHotelOffer, offerId: string) {
  const quote = offer.quotes.find((q) => q.offerId === offerId) as ProviderQuote;
  const qs = new URLSearchParams({
    offerId,
    offerType: "HOTEL",
    hotelName: offer.hotelName,
    cityCode: offer.cityCode,
    roomType: offer.roomType,
    checkIn: offer.checkIn,
    checkOut: offer.checkOut,
    providerType: quote.providerType,
    amount: String(quote.price.amount),
    currency: quote.price.currency,
  });
  return `/checkout?${qs.toString()}`;
}

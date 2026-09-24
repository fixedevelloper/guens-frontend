import type {
  FlightProviderQuote,
  HarmonizedFlightOffer,
  HarmonizedHotelOffer,
  HarmonizedPropertyOffer,
  HarmonizedVehicleOffer,
  MultiCityItinerary,
  ProviderQuote,
  RoomOffer,
} from "@/lib/api/types";

/**
 * The backend's checkout endpoint only needs an offerId + offerType (it resolves the rest
 * server-side from the OfferCache). Everything else here is denormalized purely so the
 * checkout page can render a summary without a "get offer by id" endpoint to call.
 */
export function checkoutUrlForFlight(offer: HarmonizedFlightOffer, offerId: string) {
  const quote = offer.quotes.find((q) => q.offerId === offerId) as FlightProviderQuote;
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
  if (offer.airlineName) qs.set("airlineName", offer.airlineName);
  // Stops/baggage/hold detail is per-quote (see FlightHarmonizer) - denormalized here, like
  // everything else on this URL, so the checkout summary can render it without a lookup call.
  if (quote.detail) qs.set("detail", JSON.stringify(quote.detail));
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

/**
 * Checks out the selected room itself, not offer.quotes's search-level property quote - the two
 * can be entirely different rooms/prices. `offerId` is the hotel quote the rooms were listed for
 * (used for its provider); the checkout's own offerId is `room.roomOfferId`, which the backend
 * resolves to that exact room's price and booking identifiers.
 */
function hotelCheckoutParams(offer: HarmonizedHotelOffer, offerId: string, room: RoomOffer, quantity: number) {
  const quote = offer.quotes.find((q) => q.offerId === offerId) as ProviderQuote;
  return new URLSearchParams({
    offerId: room.roomOfferId as string,
    offerType: "HOTEL",
    hotelName: offer.hotelName,
    cityCode: offer.cityCode,
    roomType: room.roomType || offer.roomType,
    checkIn: offer.checkIn,
    checkOut: offer.checkOut,
    providerType: quote.providerType,
    amount: String(room.netPrice * quantity),
    currency: room.currency,
    quantity: String(quantity),
  });
}

export function checkoutUrlForHotel(offer: HarmonizedHotelOffer, offerId: string, room: RoomOffer, quantity = 1) {
  return `/checkout?${hotelCheckoutParams(offer, offerId, room, quantity).toString()}`;
}
export function checkoutUrlForVehicle(offer: HarmonizedVehicleOffer, offerId: string) {
  const quote = offer.quotes.find((q) => q.offerId === offerId) as ProviderQuote;
  const qs = new URLSearchParams({
    offerId,
    offerType: "CAR_RENTAL",
    brand: offer.brand,
    model: offer.model,
    category: offer.category,
    pickupCity: offer.pickupCity,
    dropoffCity: offer.dropoffCity,
    rentalStart: offer.rentalStart,
    rentalEnd: offer.rentalEnd,
    providerType: quote.providerType,
    amount: String(quote.price.amount),
    currency: quote.price.currency,
  });
  return `/checkout?${qs.toString()}`;
}

export function checkoutUrlForProperty(offer: HarmonizedPropertyOffer, offerId: string) {
  const quote = offer.quotes.find((q) => q.offerId === offerId) as ProviderQuote;
  const qs = new URLSearchParams({
    offerId,
    offerType: "FURNISHED_RENTAL",
    title: offer.title,
    propertyType: offer.propertyType,
    city: offer.city,
    checkIn: offer.checkIn,
    checkOut: offer.checkOut,
    providerType: quote.providerType,
    amount: String(quote.price.amount),
    currency: quote.price.currency,
  });
  return `/checkout?${qs.toString()}`;
}

export function resellerCheckoutUrlForFlight(offer: HarmonizedFlightOffer, offerId: string) {
  const quote = offer.quotes.find((q) => q.offerId === offerId) as FlightProviderQuote;
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
  if (offer.airlineName) qs.set("airlineName", offer.airlineName);
  if (quote.detail) qs.set("detail", JSON.stringify(quote.detail));
  return `/dashboard/reseller/flights/checkout?${qs.toString()}`;
}
export function resellerCheckoutUrlForHotel(
    offer: HarmonizedHotelOffer,
    offerId: string,
    room: RoomOffer,
    quantity = 1
) {
  return `/dashboard/reseller/hotels/checkout?${hotelCheckoutParams(offer, offerId, room, quantity).toString()}`;
}
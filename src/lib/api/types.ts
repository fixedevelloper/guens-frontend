// Types mirroring the guentours-api backend contracts (com.guentours.* DTOs) 1:1
// so the frontend never has to guess field names or enum values.
import { z } from "zod";
import {UserRole} from "../auth-storage";

export type JourneyType = "ONE_WAY" | "ROUND_TRIP" | "MULTI_CITY";

export type ProviderType = "TRAVELOPRO" | "SABRE" | "TRAVELPORT" | "TRAVELTERMINUS" | "DIRECT";

export type PassengerType = "ADULT" | "CHILD" | "INFANT";

export type OfferType = "FLIGHT" | "HOTEL"| "CAR_RENTAL"| "FURNISHED_RENTAL";

export type BookingStatus =
  | "PENDING_HOLD"
  | "PENDING_PAYMENT"
  | "DEPOSIT_PAID"
  | "PAID"
  | "CONFIRMING"
  | "CONFIRMED"
  /** Ticket issuance was blocked because the provider's price moved beyond the fare-jump
   *  tolerance after payment was captured - see Booking#markPriceChanged. The customer is
   *  emailed the new price and needs to accept a supplement or request a refund; no further
   *  automated action happens on this booking. */
  | "PRICE_CHANGED"
  | "FAILED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "PENDING_AUTHORIZATION" | "SUCCEEDED" | "FAILED";

export type PaymentAuthorizationType = "PIN" | "AVS" | "REDIRECT" | "OTP" | "CLIENT_ACTION";

export type CabinClass = "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";

export type PaymentPlan = "PAY_NOW" | "PAY_LATER";

export interface Money {
  amount: string | number;
  currency: string;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  details: string[];
}

// ---------- Search ----------

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string; // ISO date (yyyy-MM-dd)
  returnDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
  journeyType?: JourneyType;
  cabinClass?: CabinClass;
  currency?: string;
}

export interface HotelSearchParams {
  cityCode: string;
  checkIn: string;
  checkOut: string;
  adults?: number;
  rooms?: number;
  currency?: string;
}

export interface FlightLeg {
  origin: string;
  destination: string;
  departureDate: string; // ISO date (yyyy-MM-dd)
  passengers?:number
}

export interface MultiCityFlightSearchParams {
  legs: FlightLeg[];
  adults?: number;
  children?: number;
  infants?: number;
  cabinClass?: CabinClass;
  currency?: string;
}

export interface MultiCityItineraryLeg {
  legIndex: number;
  airline: string;
  airlineName: string | null;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  cabinClass: string;
  offerId: string;
  /** Stops/baggage/hold detail of this leg's offer - null for providers that don't surface it. */
  detail: FlightOfferDetail | null;
}

export interface MultiCityItinerary {
  providerType: ProviderType;
  totalPrice: Money;
  legs: MultiCityItineraryLeg[];
}

// ---------- Geo (reference data) ----------

export interface AirportOption {
  airportCode: string;
  airportName: string;
  city: string;
  country: string;
}

export interface HotelCityOption {
  cityName: string;
  countryName: string;
  latitude: number;
  longitude: number;
}

export interface HotelCityAdminResponse {
  id: number;
  cityName: string;
  countryName: string;
  latitude: number;
  longitude: number;
}

export interface HotelCityUpsertRequest {
  cityName: string;
  countryName: string;
  latitude: number;
  longitude: number;
}

/** Public shape: the homepage's "popular destinations" cards. */
export interface FeaturedDestination {
  cityName: string;
  countryName: string;
  destinationCode: string | null;
  imageUrl: string | null;
}

export interface FeaturedDestinationAdminResponse {
  id: string;
  cityName: string;
  countryName: string;
  destinationCode: string | null;
  imageUrl: string | null;
  displayOrder: number;
  active: boolean;
  createdAt: string;
}

export interface FeaturedDestinationUpsertRequest {
  cityName: string;
  countryName: string;
  destinationCode?: string | null;
  imageUrl?: string | null;
  displayOrder: number;
  active: boolean;
}

export interface ProviderQuote {
  offerId: string;
  providerType: ProviderType;
  price: Money;
}

export interface AirportInfo {
  code: string;
  name: string | null;
  city: string | null;
  terminal: string | null;
}

export interface BaggageRule {
  paxType: string;
  rule: string;
  quantity: number | null;
  size: string | null;
}

export interface FlightSegmentDetail {
  airlineCode: string;
  airlineName: string | null;
  flightNumber: string;
  cabinClass: string | null;
  departure: AirportInfo;
  arrival: AirportInfo;
  departureTime: string;
  arrivalTime: string;
  duration: string | null;
  layoverAfter: string | null;
  cabinBaggage: BaggageRule[];
  checkedBaggage: BaggageRule[];
}

/** Provider/fare-specific detail (stops, baggage, hold availability) - null for providers that
 *  don't surface it (currently only TravelTerminus does).
 *
 *  `return*` fields cover a round-trip's inbound leg - the offer's own top-level `departureTime`/
 *  `arrivalTime`/`origin`/`destination` are always the outbound leg's, by design (see the backend's
 *  FlightOffer). All null/empty for a one-way offer. */
export interface FlightOfferDetail {
  holdAvailable: boolean | null;
  totalDuration: string | null;
  totalLayoverDuration: string | null;
  segments: FlightSegmentDetail[];
  returnDepartureTime: string | null;
  returnArrivalTime: string | null;
  returnTotalDuration: string | null;
  returnTotalLayoverDuration: string | null;
  returnSegments: FlightSegmentDetail[];
}

export interface FlightProviderQuote extends ProviderQuote {
  detail: FlightOfferDetail | null;
}

export interface HarmonizedFlightOffer {
  airline: string;
  airlineName: string | null;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  cabinClass: string;
  seatsAvailable: number;
  bestOfferId: string;
  quotes: FlightProviderQuote[];
}

/** One incremental SSE event from GET /api/search/flights/stream (see SearchController /
 *  ProviderOffersEvent) - `offers` is only harmonized within this one provider's own batch, so
 *  unlike the stream's final `search-completed` payload it can't merge the same physical flight
 *  quoted by another provider into one multi-quote entry. Accumulate these for progressive
 *  display, then replace them wholesale with `search-completed`'s list once it arrives. */
export interface ProviderOffersEvent {
  provider: ProviderType;
  offers: HarmonizedFlightOffer[];
}

export interface HarmonizedHotelOffer {
  hotelName: string;
  cityCode: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  rating: number;
  coverImageUrl: string | null;
  bestOfferId: string;
  quotes: ProviderQuote[];
}

/**
 * searchId is null when no enabled provider captured a pagination token for this search (e.g. the
 * only one that supports it, Travelport, was disabled or returned nothing) - hide "load more" in
 * that case, there's nothing to resume.
 */
export interface HotelSearchResult {
  searchId: string | null;
  offers: HarmonizedHotelOffer[];
}

export interface Seat {
  seatNumber: string;
  available: boolean;
}

export interface SeatMapResponse {
  rows: number;
  columns: string[];
  seats: Seat[];
}

// ---------- Ancillary options (extra baggage, meals, paid seats, travel insurance) ----------
export type AncillaryType = "BAGGAGE" | "MEAL" | "SEAT" | "INSURANCE";

/** Cabin-grid placement/attributes for a SEAT-type option - lets the checkout render an actual
 *  airplane seat map instead of a flat list. `totalRows`/`totalColumns`/`seatGroups`/`cabinClass`
 *  describe the whole segment's grid and are repeated identically on every seat in that segment. */
export interface SeatLayout {
  row: string;
  column: string;
  status: string;
  exitRow: boolean;
  accessible: boolean;
  bassinet: boolean;
  toilet: boolean;
  galley: boolean;
  totalRows: number;
  totalColumns: number;
  seatGroups: string[];
  cabinClass: string | null;
}

/**
 * One priced extra quoted for the "additional options" checkout step. `id` is an opaque cache
 * key to echo back in a traveler's `selectedAncillaryIds` - never trust a client-supplied price.
 * `paxRef` is the provider's positional passenger reference ("T1"/"T2"/...), null for a
 * booking-level option like INSURANCE. `seatLayout` is set only when `type === "SEAT"`.
 */
export interface AncillaryOptionResponse {
  id: string;
  type: AncillaryType;
  segmentId: string | null;
  code: string | null;
  label: string;
  price: Money;
  paxRef: string | null;
  seatLayout: SeatLayout | null;
}

export interface AncillaryOptionsRequest {
  offerId: string;
  offerType: OfferType;
  travelers: { fullName: string; type: PassengerType }[];
}

// ---------- Booking ----------
export interface TravelerRequest {
  fullName: string;
  dateOfBirth?: string;
  passportNumber?: string;
  type: PassengerType;
  seatNumber?: string;
  /** ISO 3166-1 alpha-2 nationality; required by some providers' flight booking APIs (e.g. Travelopro). */
  nationality?: string;
  /** ISO 3166-1 alpha-2 passport-issuing country; optional, requested by some flight booking APIs. */
  passportIssueCountry?: string;
  /** Passport expiry date; optional, requested by some flight booking APIs. */
  passportExpiryDate?: string;
  /** Passport issue date; optional client-side (not every route needs a passport at all), but
   *  TravelTerminus's real Book API rejects a passenger whose passport info is submitted without
   *  it ("passengers.0.document.issuing_date_required"). */
  passportIssueDate?: string;
  /** Ids from AncillaryOptionResponse picked for this traveler at the "additional options" step. */
  selectedAncillaryIds?: string[];
}
export interface CheckoutRequest {
  offerId: string;
  offerType: OfferType;
  contactEmail: string;
  contactFullName: string;
  contactPhone?: string;
  travelers: TravelerRequest[];
  paymentPlan?: PaymentPlan;
  /**
   * Nombre d'unités du même article, pertinent UNIQUEMENT pour offerType === "HOTEL"
   * (ex: réserver 2 chambres identiques). Pour FLIGHT, ignoré côté backend :
   * le nombre de billets/le prix se déduisent de travelers.length et de leur type
   * (ADULT/CHILD/INFANT), pas de ce champ. Défaut : 1.
   */
  quantity?: number;
}
export interface MultiCityCheckoutRequest {
  legOfferIds: string[];
  contactEmail: string;
  contactFullName: string;
  contactPhone?: string;
  travelers: TravelerRequest[];
  paymentPlan?: PaymentPlan;
  // Pas de quantity ici : un itinéraire multi-city se réserve pour le groupe de travelers
  // fourni, il n'y a pas de notion de "N fois le même itinéraire" en un seul checkout.
}
export interface BookingFlightLeg {
  legIndex: number;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
}
export interface BookingResponse {
  id: string;
  status: BookingStatus;
  offerType: OfferType;
  providerType: ProviderType;
  contactEmail: string;
  price: Money;
  paymentPlan: PaymentPlan;
  reservationFee: Money | null;
  amountDue: Money;
  /** The provider's real-time price when ticket issuance was blocked for exceeding the fare-jump
   *  tolerance - null unless status is PRICE_CHANGED. */
  revisedPrice: Money | null;
  ticketingDeadline: string | null;
  providerConfirmationNumber: string | null;
  eTicketNumbers: string[];
  itineraryLegs: BookingFlightLeg[];
  failureReason: string | null;
  /** Admin-only diagnostic detail (e.g. Travel Terminus's insufficient_funds/unauthorized/
   *  provider_down/invalid_request) - only the admin booking detail page renders this. */
  providerErrorCode: string | null;
  /** True only when FAILED and the provider hold never got a confirmation number - safe to retry. */
  retryable: boolean;
  /** True once a payment was actually captured for this booking, even if it later failed anyway
   *  (see confirmWithProvider) - sending the payer back to search would risk a second charge. */
  paymentCaptured: boolean;
  /** True once an admin has refunded the captured payment (see the admin booking detail page). */
  paymentRefunded: boolean;
  travelers: BookingTravelerResponse[];
  extras: BookingExtraResponse[];
  airline: string | null;
  flightNumber: string | null;
  origin: string | null;
  destination: string | null;
  departureTime: string | null;
  arrivalTime: string | null;
  hotelName: string | null;
  cityCode: string | null;
  checkIn: string | null;
  checkOut: string | null;
  fareClass: string | null;
  roomQuantity: number | null;
  vehicleBrand: string | null;
  vehicleModel: string | null;
  vehicleCategory: string | null;
  vehicleTransmission: string | null;
  vehicleSeats: number | null;
  pickupCity: string | null;
  dropoffCity: string | null;
  rentalStart: string | null;
  pickupTime: string | null;
  rentalEnd: string | null;
  dropoffTime: string | null;
  withDriver: boolean | null;
  propertyTitle: string | null;
  propertyType: string | null;
  country: string | null;
  bedrooms: number | null;
  maxGuests: number | null;
  entirePlace: boolean | null;
  createdAt: string;
}
export interface BookingTravelerResponse {
  fullName: string;
  type: PassengerType;
  seatNumber: string | null;
  /** True when the provider flagged this traveler as needing a passport image uploaded before
   *  payment (see BookingService#uploadRequiredPassportImage) - Travel Terminus only today. */
  passportImageRequired: boolean;
  /** Set once uploaded; its mere presence means the requirement above is already satisfied. */
  passportImageUrl: string | null;
}
export interface BookingExtraResponse {
  type: AncillaryType;
  travelerIndex: number | null;
  segmentId: string | null;
  code: string | null;
  label: string;
  price: Money;
}
export type PaymentMethod = "CARD" | "MOBILE_MONEY" | "GOOGLE_PAY" | "APPLE_PAY" | "PAYPAL";
export interface BillingAddress {
  address: string;
  city: string;
  zipCode?: string;
  state?: string;
  countryCode: string; // ISO 3166-1 alpha-2
}

// Champs communs à tous les paiements
interface BasePaymentRequest {
  bookingId: string;
  countryCode: string; // ISO 3166-1 alpha-2
  countryCurrency: string; // ISO 4217, ex. "XAF"
  /** Référence de transaction saisie par le client (SMS mobile money) - uniquement utile quand le
   *  pays est en mode paiement manuel (voir GET /api/payments/manual-info), ignoré sinon. */
  customerReference?: string;
}

// Variante Carte - Stripe (the default CARD route) collects the card itself via its own Payment
// Element after this request creates the PaymentIntent, so no card fields travel through here.
export interface CardPaymentRequest extends BasePaymentRequest {
  paymentMethod: "CARD";
}

// Variante Mobile Money
export interface MobileMoneyPaymentRequest extends BasePaymentRequest {
  paymentMethod: "MOBILE_MONEY";
  mobileNumber: string;
}

// Variante Wallets / PayPal
export interface WalletPaymentRequest extends BasePaymentRequest {
  paymentMethod: "GOOGLE_PAY" | "APPLE_PAY" | "PAYPAL";
  billingAddress?: BillingAddress;
}

// Union Discriminée
export type BookingPaymentRequest =
    | CardPaymentRequest
    | MobileMoneyPaymentRequest
    | WalletPaymentRequest;

export interface PaymentResponse {
  id: string;
  bookingId: string;
  amount: Money;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  /** Set only while status is PENDING_AUTHORIZATION - which card challenge is outstanding. */
  authorizationType: PaymentAuthorizationType | null;
  /** Set only when authorizationType is REDIRECT - where to send the payer to complete 3DS. */
  authorizationRedirectUrl: string | null;
  /** Set only when authorizationType is CLIENT_ACTION - the Stripe PaymentIntent client secret,
   *  passed to stripe.confirmPayment on the frontend (Stripe never sees this backend at all). */
  authorizationClientSecret: string | null;
  failureReason: string | null;
  /** "STRIPE"/"FLUTTERWAVE"/"MANUAL"/... - the gateway this payment was routed to at creation
   *  time. "MANUAL" means it's awaiting an agent's manual confirmation, not a gateway webhook -
   *  see ManualPaymentGateway. */
  providerName: string;
  /** Transaction reference the customer typed in - only set for a manual payment. */
  customerReference: string | null;
}

// ---------- Manual payment (agent-confirmed, see ManualPaymentGateway) ----------

export interface MerchantCodeResponse {
  id: string;
  countryCode: string;
  operatorName: string;
  code: string;
  instructions: string | null;
  active: boolean;
}

export interface ManualPaymentInfoResponse {
  /** True when countryCode is currently routed entirely to manual/agent-confirmed payment. */
  manual: boolean;
  merchantCodes: MerchantCodeResponse[];
}

/** countryCode is only read on create; operatorName/code/instructions/active left undefined on
 *  update leave that attribute unchanged (same convention as PaymentProviderRouteRequest). */
export interface MerchantCodeRequest {
  countryCode?: string;
  operatorName?: string;
  code?: string;
  instructions?: string;
  active?: boolean;
}

// ---------- Agent dashboard (manual payment confirmation, see ManualPaymentGateway) ----------

export interface AgentPendingPaymentResponse {
  paymentId: string;
  bookingId: string;
  amount: Money;
  paymentMethod: PaymentMethod;
  countryCode: string;
  customerReference: string | null;
  payerReferenceLast4: string | null;
  createdAt: string;
  contactEmail: string;
  offerType: OfferType;
}

/** Full detail for one manual payment (any status), including the entire reservation - the
 *  AgentPendingPaymentsPage detail view. See AgentPaymentController#detail. */
export interface AgentPaymentDetailResponse {
  paymentId: string;
  status: PaymentStatus;
  amount: Money;
  paymentMethod: PaymentMethod;
  countryCode: string;
  customerReference: string | null;
  payerReferenceLast4: string | null;
  failureReason: string | null;
  /** Email of the agent who confirmed this payment - null until confirmed, never set on reject. */
  confirmedByAgentEmail: string | null;
  createdAt: string;
  updatedAt: string;
  booking: BookingResponse;
}

// ---------- Admin: agent accounts (see AdminAgentController) ----------

export interface CreateAgentRequest {
  email: string;
  fullName: string;
  phone?: string;
}

/** Any field left undefined leaves that attribute unchanged (same convention as
 *  PaymentProviderRouteRequest/MerchantCodeRequest) - lets the activate/deactivate toggle send
 *  just {active} without resubmitting the rest of the form. */
export interface UpdateAgentRequest {
  fullName?: string;
  phone?: string;
  email?: string;
  active?: boolean;
}

// ---------- Admin: payment provider routing ----------

export interface PaymentProviderRouteResponse {
  id: string;
  /** null = default rule applied to every country not covered by a more specific one. */
  countryCode: string | null;
  paymentMethod: PaymentMethod;
  providerName: string;
  active: boolean;
}

/** countryCode/paymentMethod are only read on create; omit them (or send unchanged) on update. */
export interface PaymentProviderRouteRequest {
  countryCode?: string | null;
  paymentMethod?: PaymentMethod;
  providerName?: string;
  active?: boolean;
}

// ---------- Ticketing ----------

export interface ETicket {
  id: string;
  bookingId: string;
  ticketNumber: string;
  providerConfirmationNumber: string | null;
  document: string;
  /** Public MinIO URL of the branded PDF (company logo, plus the reseller's when the booking went
   *  through one) - null when PDF generation hasn't completed yet or failed; `document` (plain
   *  text) is always available as a fallback. */
  pdfUrl: string | null;
  issuedAt: string;
}


// ---------- Auth ----------

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  fullName: string;
  phone?: string;
  password: string;
}

export interface AuthResponse {
  /** Always null now - the JWT travels only as an HttpOnly cookie, never in the response body. */
  token: string | null;
  tokenType: string;
  email: string;
  fullName: string;
  role: UserRole;
  partnerId?: string; // présent uniquement pour les comptes partenaires,
  userId: string;
  resellerId?: string | null; // présent uniquement pour les comptes revendeurs approuvés
}

// ---------- Admin ----------

export interface AdminUserResponse {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
  active: boolean;
  autoProvisioned: boolean;
  mustChangePassword: boolean;
  createdAt: string;
}

export interface CommissionWalletBalanceResponse {
  balances: Money[];
  entryCount: number;
}

// Actionnaire : part fixe (en %) de chaque commission gagnée, indépendante de tout compte
// utilisateur/revendeur/partenaire.
export interface ShareholderResponse {
  id: string;
  name: string;
  percentage: string | number;
  active: boolean;
  balance: Money[];
}

// Champs omis (undefined) lors d'une mise à jour partielle - seuls les champs fournis changent.
export interface ShareholderRequest {
  name?: string;
  percentage?: number;
  active?: boolean;
}
// ---------- Pagination ----------

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // page courante (0-indexée)
  size: number;
}

// ---------- Partners ----------

export type PartnerType = "AIRLINE" | "HOTEL" | "CAR_RENTAL" | "FURNISHED_RENTAL";
export type PartnerStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED";

export interface PartnerResponse {
  id: string;
  partnerType: PartnerType;
  companyName: string;
  email: string;
  status: PartnerStatus;
  createdAt: string;
}
// ---------- Partner: Flights ----------

export type FlightStatus = "ACTIVE" | "SUSPENDED";

export interface FlightResponse {
  id: string;
  flightNumber: string;
  originAirportCode: string;
  destinationAirportCode: string;
  departureTime: string;
  arrivalTime: string;
  operatingDays: number[];
  status: FlightStatus;
  durationMinutes:number;
  aircraftType:string
}
// ---------- Partner: Hotels ----------

export interface HotelImageResponse {
  id: string;
  url: string;
  caption: string | null;
  isPrimary: boolean;
  displayOrder: number | null;
}

export interface HotelResponse {
  id: string;
  partnerId: string;
  name: string;
  address: string;
  city: string;
  country: string;
  starRating: number | null;
  description: string | null;
  amenities: string[];
  checkInTime: string | null;
  checkOutTime: string | null;
  status: "ACTIVE" | "SUSPENDED";
  coverImageUrl: string | null;
  images: HotelImageResponse[];
}
// ---------- Partner: Vehicles ----------

export type VehicleCategory = "ECONOMY" | "COMPACT" | "SUV" | "LUXURY" | "VAN" | "MINIBUS";
export type Transmission = "MANUAL" | "AUTOMATIC";

export interface VehicleImageResponse {
  id: string;
  url: string;
  caption: string | null;
  isPrimary: boolean;
  displayOrder: number | null;
}

export interface VehicleResponse {
  id: string;
  partnerId: string;
  brand: string;
  model: string;
  year: number;
  category: VehicleCategory;
  transmission: Transmission;
  seats: number;
  airConditioning: boolean;
  pricePerDay: number;
  currency: string;
  unitsCount: number;
  pickupLocations: string[];
  status: "ACTIVE" | "SUSPENDED";
  coverImageUrl: string | null;
  images: VehicleImageResponse[];
}

export interface VehicleRegistrationRequest {
  brand: string;
  model: string;
  year: number;
  category: VehicleCategory;
  transmission: Transmission;
  seats: number;
  airConditioning: boolean;
  pricePerDay: number;
  currency: string;
  unitsCount: number;
  pickupLocations: string[];
}

export interface VehicleAvailabilityResponse {
  id: string;
  rentDate: string; // "YYYY-MM-DD"
  unitsAvailable: number;
  priceOverride: number | null;
}

export interface VehicleAvailabilityFormData {
  rentDate: string;
  unitsAvailable: number;
}

// ---------- Partner: Properties ----------

export type PropertyType = "APARTMENT" | "VILLA" | "STUDIO" | "HOUSE";

/**
 * Statuts d'une annonce de location meublée
 */
export type ListingStatus = "ACTIVE" | "SUSPENDED" | "DRAFT";

/**
 * Interface du formulaire de création/édition d'une résidence meublée
 */
export interface PropertyFormData {
  title: string;
  propertyType: PropertyType;
  address: string;
  city: string;
  country: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  amenities: string[];
  pricePerNight: number;
  currency: string;
  minStayNights: number;
  description?: string;
}

export interface PropertyImageResponse {
  id: string;
  url: string;
  caption: string | null;
  isPrimary: boolean;
  displayOrder: number | null;
}

/**
 * Interface de la réponse API Spring Boot pour une propriété
 */
export interface PropertyResponse extends PropertyFormData {
  id: string;
  partnerId: string;
  status: ListingStatus;
  coverImageUrl: string | null;
  images: PropertyImageResponse[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PropertyAvailabilityResponse {
  id: string;
  stayDate: string; // "YYYY-MM-DD"
  isAvailable: boolean;
  priceOverride: number | null;
}

export interface PropertyAvailabilityFormData {
  stayDate: string;
  isAvailable: boolean;
}

/**
 * Équipements standards pour résidence meublée
 */
export interface AmenityOption {
  id: string;
  label: string;
  category?: "GENERAL" | "COMFORT" | "SECURITY" | "KITCHEN";
}

export const PROPERTY_AMENITIES: AmenityOption[] = [
  { id: "WIFI", label: "Wi-Fi Haut Débit", category: "GENERAL" },
  { id: "AIR_CONDITIONING", label: "Climatisation", category: "COMFORT" },
  { id: "SWIMMING_POOL", label: "Piscine", category: "COMFORT" },
  { id: "PARKING", label: "Parking Réservez/Gratuit", category: "GENERAL" },
  { id: "GENERATOR", label: "Groupe Électrogène", category: "SECURITY" },
  { id: "KITCHEN", label: "Cuisine Équipée", category: "KITCHEN" },
  { id: "TV", label: "Smart TV / Canal+", category: "GENERAL" },
  { id: "BALCONY", label: "Balcon / Terrasse", category: "COMFORT" },
  { id: "SECURITY_GUARD", label: "Gardien 24/7", category: "SECURITY" },
  { id: "WASHER", label: "Lave-linge", category: "GENERAL" },
];

/**
 * Schéma de validation Zod pour le formulaire de résidence meublée
 */
export const propertyFormSchema = z.object({
  title: z
    .string()
    .min(3, "Le titre doit contenir au moins 3 caractères")
    .max(120, "Le titre ne doit pas dépasser 120 caractères"),
  propertyType: z.enum(["APARTMENT", "HOUSE", "VILLA", "STUDIO"] as const, {
    message: "Veuillez sélectionner un type d'hébergement", // 👈 Utiliser 'message' à la place de 'required_error'
  }),
  address: z.string().min(3, "L'adresse est requise"),
  city: z.string().min(2, "La ville est requise"),
  country: z.string().min(2, "Le pays est requis"),
  bedrooms: z.number().int().min(0, "Le nombre de chambres ne peut pas être négatif"),
  bathrooms: z.number().int().min(1, "Il faut au moins 1 salle de bain"),
  maxGuests: z.number().int().min(1, "La capacité minimale est de 1 personne"),
  amenities: z.array(z.string()).default([]),
  pricePerNight: z.number().positive("Le prix par nuit doit être supérieur à 0"),
  currency: z.string().default("XAF"),
  minStayNights: z.number().int().min(1, "Le séjour minimum est d'au moins 1 nuit"),
  description: z.string().max(2000, "La description ne peut pas dépasser 2000 caractères").optional(),
});

/**
 * Valeurs initiales par défaut pour la création
 */
export const DEFAULT_PROPERTY_FORM_VALUES: PropertyFormData = {
  title: "",
  propertyType: "APARTMENT",
  address: "",
  city: "",
  country: "Cameroun",
  bedrooms: 1,
  bathrooms: 1,
  maxGuests: 2,
  amenities: ["WIFI", "AIR_CONDITIONING"],
  pricePerNight: 0,
  currency: "XAF",
  minStayNights: 1,
  description: "",
};
export interface FlightFormData {
  partnerId: string;
  flightNumber: string;
  aircraftType: string;
  originAirportCode: string;
  destinationAirportCode: string;
  departureTime: string; // Format "HH:mm:ss" pour LocalTime Java
  arrivalTime: string;   // Format "HH:mm:ss" pour LocalTime Java
  durationMinutes: number;
  operatingDays: number[]; // Tableau des jours 1-7
}
// lib/api/types.ts — ajouts

export interface FareResponse {
  id: string;
  cabinClass: CabinClass;
  basePrice: number;
  currency: string;
  baggageAllowanceKg: number;
  totalSeats: number;
}

export interface FareFormData {
  cabinClass: CabinClass;
  basePrice: number;
  currency: string;
  baggageAllowanceKg: number;
  totalSeats: number;
}

export type DepartureStatus = "SCHEDULED" | "DELAYED" | "CANCELLED" | "DEPARTED";

export interface AvailabilityResponse {
  id: string;
  flightDate: string; // "YYYY-MM-DD"
  seatsAvailable: number;
  priceOverride: number | null;
  status: DepartureStatus;
}

export interface AvailabilityFormData {
  flightDate: string;
  seatsAvailable: number;
}
export interface RoomAvailabilityResponse {
  id: string;
  stayDate: string; // "YYYY-MM-DD"
  roomsAvailable: number;
  priceOverride: number | null;
}

export interface RoomAvailabilityFormData {
  stayDate: string;
  roomsAvailable: number;
}

export interface RoomImageResponse {
  id: string;
  url: string;
  caption: string | null;
  isPrimary: boolean;
  displayOrder: number | null;
}

export interface RoomTypeResponse {
  id: string;
  name: string;
  maxAdults: number;
  maxChildren: number;
  bedType: string ;
  sizeSqm: number;
  basePrice: number;
  currency: string;
  totalRooms: number;
      description?: string;
    pricePerNight: number;
    maxOccupancy: number;
    quantity: number;
    coverImageUrl?: string;
    amenities: string[];
  images: RoomImageResponse[];
  status: "ACTIVE" | "SUSPENDED";
}
export interface RoomAvailabilityResponse {
  id: string;
  stayDate: string; // "YYYY-MM-DD"
  roomsAvailable: number;
  priceOverride: number | null;
}

export interface RoomAvailabilityFormData {
  stayDate: string;
  roomsAvailable: number;
}
export interface HotelImage {
  caption: string;
  url: string;
}

export interface HotelDescription {
  content: string;
}

export interface HotelDetail {
  hotelId: string;
  name: string;
  address: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  hotelRating: number;
  description: HotelDescription;
  facilities: string[];
  hotelImages: HotelImage[];
  hotelReview: string | null;
}
export interface RoomOffer {
  productId: string;
  roomType: string;
  description: string;
  roomCode: string;
  fareType: string;
  rateBasisId: string;
  currency: string;
  netPrice: number;
  boardType: string;
  maxOccupancyPerRoom: number;
  inventoryType: string;
  cancellationPolicy: string;
  roomImages: string[];
  facilities: string[];
}
export interface ResellerFormData {
  companyName: string;
  registrationNumber: string;
  contactName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  description: string;
  logo: File | null;
}
// Entité Revendeur renvoyée par le serveur
export interface Reseller {
  id: string | number;
  companyName: string;
  registrationNumber: string;
  contactName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  description?: string | null;
  logoUrl?: string | null;
  status: ResellerStatus;
   promoCode: string;
   commissionRate: number; // ex: 0.10 pour 10%
  walletBalance: number;
  totalSales: number;
  totalBookingsCount?: number;
  subscriptionStatus: "active" | "inactive" | "pending_payment";
  createdAt: string; // Format ISO string (ex: "2026-07-25T04:20:00Z")
  updatedAt: string;
}
// Réponse standard pour la création ou la récupération d'un seul revendeur
export interface ResellerResponse {
  success: boolean;
  message: string;
  data: Reseller;
}
export interface ResellerApprovalRequest {
  /** Taux de commission compris entre 0.0 et 1.0 (ex: 0.15 pour 15%) */
  commissionRate: number;
}

// Réponse pour les listes paginées (ex: dashboard admin)
export interface ResellerListResponse {
  success: boolean;
  message?: string;
  data: Reseller[];
  meta?: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
}
export type ResellerStatus = "PENDING_REVIEW" | "APPROVED" | "SUSPENDED" | "REJECTED";

export interface ResellerDetail {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  city?: string;
  country?: string;
  registrationNumber?: string;
  promoCode: string;
  commissionRate: number; // ex: 0.10 pour 10%
  walletBalance: number;
  totalSales: number;
  totalBookingsCount?: number;
  status: ResellerStatus;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/** Miroir de ResellerBookingResponse (GET /api/resellers/{id}/bookings). */
export interface ResellerBooking {
  id: string;
  resellerId: string;
  contactEmail: string;
  offerType: string;
  summary: string;
  ticketingDeadline: string | null;
  pnrCode: string | null;
  totalAmount: number;
  currency: string;
  status: string;
  travelerCount: number;
  createdAt: string;
  /** Marge choisie par le revendeur pour cette vente (0.05 = 5 %), null sur les ventes d'avant la marge. */
  markupRate: number | null;
  /** Marge du revendeur sur cette vente = sa commission (null sur les ventes d'avant la marge). */
  markupAmount: number | null;
}

export interface ResellerWithdrawal {
  id: string;
  amount: number;
  payoutMethod: string; // ex: "MOBILE_MONEY", "BANK_TRANSFER"
  status: "PENDING" | "COMPLETED" | "REJECTED";
  createdAt: string;
}

// ---------- Reseller self-service (own dashboard: /dashboard/reseller/**) ----------
// Mirrors the real backend contracts 1:1 (ResellerController / ResellerCommissionResponse /
// ResellerWithdrawalResponse) - unlike the invented shapes above, kept for the admin screens.

/** Flat shape ResellerController actually returns (GET /api/resellers/{id}) - not the
 *  {success,message,data} envelope ResellerResponse/Reseller above assume. */
export interface ResellerProfile {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  promoCode: string;
  commissionRate: number; // fraction, e.g. 0.10 for 10%
  status: ResellerStatus;
  createdAt: string;
}

export interface ResellerCommissionEntry {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: "PENDING" | "AVAILABLE" | "PAID" | "CANCELLED";
  createdAt: string;
}

export interface ResellerBalance {
  withdrawableBalance: number;
}

export interface ResellerWithdrawalEntry {
  id: string;
  resellerId: string;
  amount: number;
  remainingWallet: number;
  currency: string;
  paymentMethod: string;
  paymentDetails: string;
  status: "PENDING" | "PROCESSING" | "APPROVED" | "REJECTED";
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  processedAt?: string | null;
}

export interface ResellerWithdrawalRequestPayload {
  amount: number;
  currency?: string;
  paymentMethod: string;
  paymentDetails: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
}

export interface UpdateCommissionPayload {
  commissionRate: number;
}
export interface UpdatePartnerDto {
  companyName?: string;
  phone?: string;
  city?: string;
  country?: string;
  description?: string;
  logoUrl?: string;
}
export interface PartnerUpdateRequest {
  companyName?: string;
  phone?: string;
  city?: string;
  country?: string;
  description?: string;
}
// lib/api/types.ts — ajouts

export interface VehicleSearchParams {
  pickupCity: string;
  dropoffCity?: string;
  rentalStart: string; // ISO date
  pickupTime?: string; // HH:mm
  rentalEnd: string;
  dropoffTime?: string;
  category?: string;
  withDriver?: boolean;
  driverAge25Plus?: boolean;
  currency?: string;
}

export interface HarmonizedVehicleOffer {
  brand: string;
  model: string;
  category: string;
  transmission: string;
  seats: number;
  airConditioning: boolean;
  pickupCity: string;
  dropoffCity: string;
  rentalStart: string;
  pickupTime: string | null;
  rentalEnd: string;
  dropoffTime: string | null;
  withDriver: boolean;
  driverAge25Plus: boolean;
  bestOfferId: string;
  quotes: ProviderQuote[];
}
export interface PropertySearchParams {
  city: string;
  checkIn: string;
  checkOut: string;
  guests?: number;
  bedrooms?: number;
  propertyType?: string;
  entirePlace?: boolean;
  currency?: string;
}

export interface HarmonizedPropertyOffer {
  title: string;
  propertyType: string;
  city: string;
  country: string;
  bedrooms: number;
  maxGuests: number;
  entirePlace: boolean;
  checkIn: string;
  checkOut: string;
  bestOfferId: string;
  quotes: ProviderQuote[];
}

/** Live baggage/meals/seats/cancellation-policy detail for a confirmed flight booking - see
 *  GET /api/bookings/{id}/flight-order-detail. Route/times/passenger names already live on the
 *  BookingResponse itself and aren't duplicated here. */
export interface FlightOrderDetail {
  bookingStatus: string | null;
  travelers: FlightOrderDetailTraveler[];
  cancellationRules: FlightOrderDetailCancellationRule[];
}

export interface FlightOrderDetailTraveler {
  firstName: string | null;
  lastName: string | null;
  paxType: string | null;
  baggages: FlightOrderDetailBaggage[];
  meals: FlightOrderDetailMeal[];
  seats: FlightOrderDetailSeat[];
}

export interface FlightOrderDetailBaggage {
  segmentId: string | null;
  departure: string | null;
  arrival: string | null;
  description: string | null;
  price: string | null;
  currency: string | null;
}

export interface FlightOrderDetailMeal {
  segmentId: string | null;
  departure: string | null;
  arrival: string | null;
  description: string | null;
  price: string | null;
  currency: string | null;
}

export interface FlightOrderDetailSeat {
  segmentId: string | null;
  departure: string | null;
  arrival: string | null;
  row: string | null;
  column: string | null;
  price: string | null;
  currency: string | null;
}

export interface FlightOrderDetailCancellationRule {
  adultCharges: string | null;
  currency: string | null;
  refundable: boolean;
}
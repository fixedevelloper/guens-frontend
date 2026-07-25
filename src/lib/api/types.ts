// Types mirroring the guentours-api backend contracts (com.guentours.* DTOs) 1:1
// so the frontend never has to guess field names or enum values.
import { z } from "zod";
import {UserRole} from "../auth-storage";

export type JourneyType = "ONE_WAY" | "ROUND_TRIP" | "MULTI_CITY";

export type ProviderType = "TRAVELOPRO" | "SABRE" | "TRAVELPORT";

export type PassengerType = "ADULT" | "CHILD" | "INFANT";

export type OfferType = "FLIGHT" | "HOTEL";

export type BookingStatus =
  | "PENDING_PAYMENT"
  | "DEPOSIT_PAID"
  | "PAID"
  | "CONFIRMING"
  | "CONFIRMED"
  | "FAILED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED";

export type CabinClass = "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";

export type PaymentPlan = "PAY_NOW" | "PAY_LATER";

export type PaymentMethod = "CARD" | "MTN_MOBILE_MONEY" | "ORANGE_MONEY";

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
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  cabinClass: string;
  offerId: string;
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

export interface ProviderQuote {
  offerId: string;
  providerType: ProviderType;
  price: Money;
}

export interface HarmonizedFlightOffer {
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  cabinClass: string;
  seatsAvailable: number;
  bestOfferId: string;
  quotes: ProviderQuote[];
}

export interface HarmonizedHotelOffer {
  hotelName: string;
  cityCode: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  rating: number;
  bestOfferId: string;
  quotes: ProviderQuote[];
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

// ---------- Booking ----------

export interface TravelerRequest {
  fullName: string;
  dateOfBirth?: string;
  passportNumber?: string;
  type: PassengerType;
  seatNumber?: string;
}

export interface CheckoutRequest {
  offerId: string;
  offerType: OfferType;
  contactEmail: string;
  contactFullName: string;
  contactPhone?: string;
  travelers: TravelerRequest[];
  paymentPlan?: PaymentPlan;
}

export interface MultiCityCheckoutRequest {
  legOfferIds: string[];
  contactEmail: string;
  contactFullName: string;
  contactPhone?: string;
  travelers: TravelerRequest[];
  paymentPlan?: PaymentPlan;
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
  ticketingDeadline: string | null;
  providerConfirmationNumber: string | null;
  eTicketNumbers: string[];
  itineraryLegs: BookingFlightLeg[];
  failureReason: string | null;
  travelers: BookingTravelerResponse[];
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
  createdAt: string;
}

export interface BookingTravelerResponse {
  fullName: string;
  type: PassengerType;
  seatNumber: string | null;
}

// ---------- Payment ----------

export interface PaymentRequest {
  bookingId: string;
  paymentMethod: PaymentMethod;
  cardNumber?: string;
  cardHolderName?: string;
  expiry?: string;
  cvv?: string;
  mobileNumber?: string;
}

export interface PaymentResponse {
  paymentId: string;
  bookingId: string;
  amount: Money;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  failureReason: string | null;
}

// ---------- Ticketing ----------

export interface ETicket {
  id: string;
  bookingId: string;
  ticketNumber: string;
  tempPassword:string;
  providerConfirmationNumber: string | null;
  document: string;
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
  token: string;
  tokenType: string;
  email: string;
  fullName: string;
  role: UserRole;
  partnerId?: string; // présent uniquement pour les comptes partenaires,
  userId: string; // présent uniquement pour les comptes partenaires
}

// ---------- Admin ----------

export interface AdminUserResponse {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
  partnerId: string | null;
  autoProvisioned: boolean;
  createdAt: string;
}

export interface CommissionWalletBalanceResponse {
  balances: Money[];
  entryCount: number;
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

export interface HotelResponse {
  id: string;
  name: string;
  city: string;
  country: string;
  starRating: number | null;
  status: "ACTIVE" | "SUSPENDED";
  coverImageUrl: string | null;
}
// ---------- Partner: Vehicles ----------

export type VehicleCategory = "ECONOMY" | "COMPACT" | "SUV" | "LUXURY" | "VAN" | "MINIBUS";

export interface VehicleResponse {
  id: string;
  brand: string;
  model: string;
  category: VehicleCategory;
  pricePerDay: number;
  currency: string;
  unitsCount: number;
  status: "ACTIVE" | "SUSPENDED";
}

// ---------- Partner: Properties ----------

export type PropertyType = "APARTMENT" | "VILLA" | "STUDIO" | "HOUSE";

export interface PropertyResponse {
  id: string;
  title: string;
  propertyType: PropertyType;
  city: string;
  pricePerNight: number;
  currency: string;
}


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

/**
 * Interface de la réponse API Spring Boot pour une propriété
 */
export interface PropertyResponse extends PropertyFormData {
  id: string;
  partnerId: string;
  status: ListingStatus;
  coverImageUrl?: string;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
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

export interface ResellerBooking {
  id: string;
  pnrNumber?: string;
  passengerName: string;
  totalAmount: number;
  commissionAmount: number;
  status: string;
  createdAt: string;
}

export interface ResellerWithdrawal {
  id: string;
  amount: number;
  payoutMethod: string; // ex: "MOBILE_MONEY", "BANK_TRANSFER"
  status: "PENDING" | "COMPLETED" | "REJECTED";
  createdAt: string;
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
import { PartnerRegistrationRequest, PartnerResponse } from "@/types/partner";
import { HotelFormData } from "@/types/hotel-form";
import { apiClient } from "./client";

import type {
    AvailabilityFormData,
    AvailabilityResponse, FareFormData, FareResponse,
    FlightFormData,
    FlightResponse,
    HotelResponse,
    PageResponse, PropertyFormData,
    PropertyResponse, RoomAvailabilityFormData, RoomAvailabilityResponse,
    VehicleResponse,
} from "./types";
import { BookingResponse } from "./types";
import { RoomType } from "../../components/partner/rooms/HotelRoomsManager";
import { RoomFormData } from "../../components/partner/rooms/RoomForm";

// --- Flights ---

export async function getPartnerFlights(partnerId: string, page: number, size = 20) {
    const { data } = await apiClient.get<PageResponse<FlightResponse>>(
        `/api/partners/${partnerId}/flights`,
        { params: { page, size } }
    );
    return data;
}
/**
 * Crée un nouveau vol pour un partenaire donné
 * Route Spring: POST /api/partners/{partnerId}/flights
 */
export async function createFlight(
    partnerId: string,
    payload: FlightFormData
): Promise<FlightResponse> {
    const { data } = await apiClient.post<FlightResponse>(
        `/api/partners/${partnerId}/flights`,
        payload
    );
    return data;
}
export async function suspendFlight(partnerId: string, flightId: string) {
    await apiClient.patch(`/api/partners/${partnerId}/flights/${flightId}/suspend`);
}

export async function activateFlight(partnerId: string, flightId: string) {
    await apiClient.patch(`/api/partners/${partnerId}/flights/${flightId}/activate`);
}

export async function deleteFlight(partnerId: string, flightId: string) {
    await apiClient.delete(`/api/partners/${partnerId}/flights/${flightId}`);
}
/**
 * Récupère les détails d'un vol par son ID
 * Route Spring: GET /api/partners/{partnerId}/flights/{flightId}
 */
export async function getFlightById(partnerId: string, flightId: string): Promise<FlightResponse> {
    const { data } = await apiClient.get<FlightResponse>(
        `/api/partners/${partnerId}/flights/${flightId}`
    );
    return data;
}
// --- Hotels ---

export async function getPartnerHotels(partnerId: string, page: number, size = 20) {
    const { data } = await apiClient.get<PageResponse<HotelResponse>>(
        `/api/partners/${partnerId}/hotels`,
        { params: { page, size } }
    );
    return data;
}

/**
 * Crée un nouvel hôtel pour un partenaire donné
 */
export async function createHotel(partnerId: string, payload: HotelFormData): Promise<HotelResponse> {
    const { data } = await apiClient.post<HotelResponse>(
        `/api/partners/${partnerId}/hotels`,
        payload
    );
    return data;
}

export async function suspendHotel(partnerId: string, hotelId: string) {
    await apiClient.patch(`/api/partners/${partnerId}/hotels/${hotelId}/suspend`);
}

export async function activateHotel(partnerId: string, hotelId: string) {
    await apiClient.patch(`/api/partners/${partnerId}/hotels/${hotelId}/activate`);
}

export async function deleteHotel(partnerId: string, hotelId: string) {
    await apiClient.delete(`/api/partners/${partnerId}/hotels/${hotelId}`);
}

// --- Vehicles ---

export async function getPartnerVehicles(partnerId: string, page: number, size = 20) {
    const { data } = await apiClient.get<PageResponse<VehicleResponse>>(
        `/api/partners/${partnerId}/vehicles`,
        { params: { page, size } }
    );
    return data;
}

export async function suspendVehicle(partnerId: string, vehicleId: string) {
    await apiClient.patch(`/api/partners/${partnerId}/vehicles/${vehicleId}/suspend`);
}

export async function activateVehicle(partnerId: string, vehicleId: string) {
    await apiClient.patch(`/api/partners/${partnerId}/vehicles/${vehicleId}/activate`);
}

export async function deleteVehicle(partnerId: string, vehicleId: string) {
    await apiClient.delete(`/api/partners/${partnerId}/vehicles/${vehicleId}`);
}

// --- Properties (Locations Meublées) ---

export async function getPartnerProperties(partnerId: string, page: number, size = 20) {
    const { data } = await apiClient.get<PageResponse<PropertyResponse>>(
        `/api/partners/${partnerId}/properties`,
        { params: { page, size } }
    );
    return data;
}

/**
 * Crée une nouvelle résidence meublée pour un partenaire donné
 * Route Spring: POST /api/partners/{partnerId}/properties
 */
export async function createProperty(
    partnerId: string,
    payload: PropertyFormData
): Promise<PropertyResponse> {
    const { data } = await apiClient.post<PropertyResponse>(
        `/api/partners/${partnerId}/properties`,
        payload
    );
    return data;
}

/**
 * Récupère les détails d'une propriété par son ID
 * Route Spring: GET /api/partners/{partnerId}/properties/{propertyId}
 */
export async function getPropertyById(
    partnerId: string,
    propertyId: string
): Promise<PropertyResponse> {
    const { data } = await apiClient.get<PropertyResponse>(
        `/api/partners/${partnerId}/properties/${propertyId}`
    );
    return data;
}

/**
 * Met à jour une résidence meublée
 * Route Spring: PUT /api/partners/{partnerId}/properties/{propertyId}
 */
export async function updateProperty(
    partnerId: string,
    propertyId: string,
    payload: Partial<PropertyFormData>
): Promise<PropertyResponse> {
    const { data } = await apiClient.put<PropertyResponse>(
        `/api/partners/${partnerId}/properties/${propertyId}`,
        payload
    );
    return data;
}

export async function suspendProperty(partnerId: string, propertyId: string) {
    await apiClient.patch(`/api/partners/${partnerId}/properties/${propertyId}/suspend`);
}

export async function activateProperty(partnerId: string, propertyId: string) {
    await apiClient.patch(`/api/partners/${partnerId}/properties/${propertyId}/activate`);
}

export async function deleteProperty(partnerId: string, propertyId: string) {
    await apiClient.delete(`/api/partners/${partnerId}/properties/${propertyId}`);
}

// --- Partner Management ---

export async function createPartner(request: PartnerRegistrationRequest): Promise<PartnerResponse> {
    const { data } = await apiClient.post<PartnerResponse>("/api/partners/register", request);
    return data;
}

export async function getPartner(partnerId: string) {
    const { data } = await apiClient.get<PartnerResponse>(`/api/partners/${partnerId}`);
    return data;
}

// --- Types ---
export interface RoomResponse {
    data: RoomType[];
}

// --- Hotel Rooms ---
export interface RoomTypeResponse {
    id: string;
    name: string;
    description?: string;
    pricePerNight: number;
    maxOccupancy: number;
    bedType: string;
    quantity: number;
    coverImageUrl?: string;
    amenities: string[];
    status: "ACTIVE" | "SUSPENDED";
}

// --- Hotel Room Types Endpoints ---

/**
 * Récupère tous les types de chambre pour un hôtel
 * Route Spring: GET /api/partners/{partnerId}/hotels/{hotelId}/room-types
 */
export async function getHotelRooms(partnerId: string, hotelId: string): Promise<RoomTypeResponse[]> {
    const { data } = await apiClient.get<RoomTypeResponse[]>(
        `/api/partners/${partnerId}/hotels/${hotelId}/room-types`
    );
    return data;
}

/**
 * Bascule le statut d'une chambre (Activer/Masquer)
 * Route Spring: PATCH /api/partners/{partnerId}/hotels/room-types/{roomTypeId}/status
 */
export async function toggleRoomStatus(
    partnerId: string,
    roomTypeId: string,
    status: "ACTIVE" | "SUSPENDED"
) {
    const { data } = await apiClient.patch(
        `/api/partners/${partnerId}/hotels/room-types/${roomTypeId}/status`,
        { status }
    );
    return data;
}

/**
 * Supprime un type de chambre
 * Route Spring: DELETE /api/partners/{partnerId}/hotels/room-types/{roomTypeId}
 */
export async function deleteRoom(partnerId: string, roomTypeId: string) {
    const { data } = await apiClient.delete(
        `/api/partners/${partnerId}/hotels/room-types/${roomTypeId}`
    );
    return data;
}

/**
 * Ajoute une image à un type de chambre
 * Route Spring: POST /api/partners/{partnerId}/hotels/room-types/{roomTypeId}/images
 */
export async function addRoomTypeImage(
    partnerId: string,
    roomTypeId: string,
    imageUrl: string
) {
    const { data } = await apiClient.post<RoomTypeResponse>(
        `/api/partners/${partnerId}/hotels/room-types/${roomTypeId}/images`,
        { imageUrl }
    );
    return data;
}

export async function createRoomType(
    partnerId: string,
    hotelId: string,
    data: RoomFormData
) {
    const { data: response } = await apiClient.post<RoomTypeResponse>(
        `/api/partners/${partnerId}/hotels/${hotelId}/room-types`,
        data
    );
    return response;
}

/**
 * Récupère les détails d'un type de chambre par son ID
 * Route Spring: GET /api/partners/{partnerId}/hotels/room-types/{roomTypeId}
 */
export async function getRoomTypeById(
    partnerId: string,
    roomTypeId: string
): Promise<RoomTypeResponse> {
    const { data } = await apiClient.get<RoomTypeResponse>(
        `/api/partners/${partnerId}/hotels/room-types/${roomTypeId}`
    );
    return data;
}

/**
 * Met à jour un type de chambre
 * Route Spring: PUT /api/partners/{partnerId}/hotels/room-types/{roomTypeId}
 */
export async function updateRoomType(
    partnerId: string,
    roomTypeId: string,
    data: RoomFormData
): Promise<RoomTypeResponse> {
    const { data: response } = await apiClient.put<RoomTypeResponse>(
        `/api/partners/${partnerId}/hotels/room-types/${roomTypeId}`,
        data
    );
    return response;
}
export async function getFares(partnerId: string, flightId: string) {
    const { data } = await apiClient.get<FareResponse[]>(
        `/api/partners/${partnerId}/flights/${flightId}/fares`
    );
    return data;
}

export async function createFare(partnerId: string, flightId: string, payload: FareFormData) {
    const { data } = await apiClient.post<FareResponse>(
        `/api/partners/${partnerId}/flights/${flightId}/fares`,
        payload
    );
    return data;
}

export async function deleteFare(partnerId: string, fareId: string) {
    await apiClient.delete(`/api/partners/${partnerId}/flights/fares/${fareId}`);
}

export async function getFareAvailability(partnerId: string, fareId: string, from: string, to: string) {
    const { data } = await apiClient.get<AvailabilityResponse[]>(
        `/api/partners/${partnerId}/flights/fares/${fareId}/availability`,
        { params: { from, to } }
    );
    return data;
}

export async function upsertFareAvailability(
    partnerId: string,
    fareId: string,
    payload: AvailabilityFormData
) {
    const { data } = await apiClient.put<AvailabilityResponse>(
        `/api/partners/${partnerId}/flights/fares/${fareId}/availability`,
        payload
    );
    return data;
}
export async function getRoomAvailability(
    partnerId: string,
    roomTypeId: string,
    from: string,
    to: string
) {
    const { data } = await apiClient.get<RoomAvailabilityResponse[]>(
        `/api/partners/${partnerId}/hotels/room-types/${roomTypeId}/availability`,
        { params: { from, to } }
    );
    return data;
}

export async function upsertRoomAvailability(
    partnerId: string,
    roomTypeId: string,
    payload: RoomAvailabilityFormData
) {
    const { data } = await apiClient.put<RoomAvailabilityResponse>(
        `/api/partners/${partnerId}/hotels/room-types/${roomTypeId}/availability`,
        payload
    );
    return data;
}
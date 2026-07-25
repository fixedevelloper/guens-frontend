import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as partnerApi from "@/lib/api/partner";
import {HotelFormData} from "../types/hotel-form";
import {createFlight, createHotel} from "../lib/api/partner";
import {RoomFormData} from "../components/partner/rooms/RoomForm";
import {AvailabilityFormData, FlightFormData, RoomAvailabilityFormData} from "../lib/api/types";
// --- Flights ---
export function useCreateFlightMutation(partnerId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: FlightFormData) => partnerApi.createFlight(partnerId, payload),
        onSuccess: () => {
            // Invalide le cache de la liste des vols pour forcer le rafraîchissement
            queryClient.invalidateQueries({
                queryKey: ["partner-flights", partnerId],
            });
        },
    });
}
export function useFlightDetailsQuery(partnerId: string, flightId: string) {
    return useQuery({
        queryKey: ["partner-flight", partnerId, flightId],
        queryFn: () => partnerApi.getFlightById(partnerId, flightId),
        enabled: !!partnerId && !!flightId,
    });
}
export function useFlightsQuery(partnerId: string, page: number) {
    return useQuery({
        queryKey: ["partner-flights", partnerId, page],
        queryFn: () => partnerApi.getPartnerFlights(partnerId, page),
        enabled: !!partnerId,
    });
}

export function useSuspendFlightMutation(partnerId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (flightId: string) => partnerApi.suspendFlight(partnerId, flightId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["partner-flights", partnerId] }),
    });
}

export function useActivateFlightMutation(partnerId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (flightId: string) => partnerApi.activateFlight(partnerId, flightId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["partner-flights", partnerId] }),
    });
}

export function useDeleteFlightMutation(partnerId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (flightId: string) => partnerApi.deleteFlight(partnerId, flightId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["partner-flights", partnerId] }),
    });
}

// --- Hotels ---

export function useHotelsQuery(partnerId: string, page: number) {
    return useQuery({
        queryKey: ["partner-hotels", partnerId, page],
        queryFn: () => partnerApi.getPartnerHotels(partnerId, page),
        enabled: !!partnerId,
    });
}

export function useSuspendHotelMutation(partnerId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (hotelId: string) => partnerApi.suspendHotel(partnerId, hotelId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["partner-hotels", partnerId] }),
    });
}

export function useActivateHotelMutation(partnerId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (hotelId: string) => partnerApi.activateHotel(partnerId, hotelId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["partner-hotels", partnerId] }),
    });
}

export function useDeleteHotelMutation(partnerId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (hotelId: string) => partnerApi.deleteHotel(partnerId, hotelId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["partner-hotels", partnerId] }),
    });
}

// --- Vehicles ---

export function useVehiclesQuery(partnerId: string, page: number) {
    return useQuery({
        queryKey: ["partner-vehicles", partnerId, page],
        queryFn: () => partnerApi.getPartnerVehicles(partnerId, page),
        enabled: !!partnerId,
    });
}

export function useSuspendVehicleMutation(partnerId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (vehicleId: string) => partnerApi.suspendVehicle(partnerId, vehicleId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["partner-vehicles", partnerId] }),
    });
}

export function useActivateVehicleMutation(partnerId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (vehicleId: string) => partnerApi.activateVehicle(partnerId, vehicleId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["partner-vehicles", partnerId] }),
    });
}

export function useDeleteVehicleMutation(partnerId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (vehicleId: string) => partnerApi.deleteVehicle(partnerId, vehicleId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["partner-vehicles", partnerId] }),
    });
}

// --- Properties ---

export function usePropertiesQuery(partnerId: string, page: number) {
    return useQuery({
        queryKey: ["partner-properties", partnerId, page],
        queryFn: () => partnerApi.getPartnerProperties(partnerId, page),
        enabled: !!partnerId,
    });
}

export function useSuspendPropertyMutation(partnerId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (propertyId: string) => partnerApi.suspendProperty(partnerId, propertyId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["partner-properties", partnerId] }),
    });
}

export function useActivatePropertyMutation(partnerId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (propertyId: string) => partnerApi.activateProperty(partnerId, propertyId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["partner-properties", partnerId] }),
    });
}

export function useDeletePropertyMutation(partnerId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (propertyId: string) => partnerApi.deleteProperty(partnerId, propertyId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["partner-properties", partnerId] }),
    });
}

export function useCreateHotel() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ partnerId, data }: { partnerId: string; data: HotelFormData }) =>
            createHotel(partnerId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["partner-hotels", variables.partnerId],
            });
        },
    });
}
export function usePartnerQuery(partnerId: string | null) {
    return useQuery({
        queryKey: ["partner", partnerId],
        queryFn: () => partnerApi.getPartner(partnerId as string),
        enabled: Boolean(partnerId),
        staleTime: 1000 * 60 * 5, // Optionnel: garde les données fraîches pendant 5 min
    });
}
// --- Hotel Rooms ---


// --- Room Types Hooks ---

export function useHotelRoomsQuery(partnerId: string, hotelId: string) {
    return useQuery({
        queryKey: ["partner-hotel-rooms", partnerId, hotelId],
        queryFn: () => partnerApi.getHotelRooms(partnerId, hotelId),
        enabled: Boolean(partnerId && hotelId),
    });
}

export function useToggleRoomStatusMutation(partnerId: string, hotelId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ roomTypeId, status }: { roomTypeId: string; status: "ACTIVE" | "SUSPENDED" }) =>
            partnerApi.toggleRoomStatus(partnerId, roomTypeId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["partner-hotel-rooms", partnerId, hotelId] });
        },
    });
}

export function useDeleteRoomMutation(partnerId: string, hotelId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (roomTypeId: string) => partnerApi.deleteRoom(partnerId, roomTypeId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["partner-hotel-rooms", partnerId, hotelId] });
        },
    });
}
export function useCreateRoomTypeMutation(partnerId: string, hotelId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: RoomFormData) =>
            partnerApi.createRoomType(partnerId, hotelId, data),
        onSuccess: () => {
            // Invalide le cache pour rafraîchir la liste des chambres
            queryClient.invalidateQueries({
                queryKey: ["partner-hotel-rooms", partnerId, hotelId],
            });
        },
    });
}
// Hook pour récupérer la chambre à modifier
export function useRoomTypeQuery(partnerId: string, roomTypeId: string) {
    return useQuery({
        queryKey: ["partner-room-type", partnerId, roomTypeId],
        queryFn: () => partnerApi.getRoomTypeById(partnerId, roomTypeId),
        enabled: Boolean(partnerId && roomTypeId),
    });
}

// Hook pour la mutation de mise à jour
export function useUpdateRoomTypeMutation(partnerId: string, hotelId: string, roomTypeId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: RoomFormData) =>
            partnerApi.updateRoomType(partnerId, roomTypeId, data),
        onSuccess: () => {
            // Invalidation des caches correspondants
            queryClient.invalidateQueries({
                queryKey: ["partner-hotel-rooms", partnerId, hotelId],
            });
            queryClient.invalidateQueries({
                queryKey: ["partner-room-type", partnerId, roomTypeId],
            });
        },
    });
}



export function useCreatePropertyMutation(partnerId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: PropertyFormData) => partnerApi.createProperty(partnerId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["properties", partnerId],
            });
        },
    });
}
export function useFaresQuery(partnerId: string, flightId: string) {
    return useQuery({
        queryKey: ["partner-flight-fares", partnerId, flightId],
        queryFn: () => partnerApi.getFares(partnerId, flightId),
        enabled: Boolean(partnerId && flightId),
    });
}

export function useCreateFareMutation(partnerId: string, flightId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: FareFormData) => partnerApi.createFare(partnerId, flightId, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["partner-flight-fares", partnerId, flightId] }),
    });
}

export function useDeleteFareMutation(partnerId: string, flightId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (fareId: string) => partnerApi.deleteFare(partnerId, fareId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["partner-flight-fares", partnerId, flightId] }),
    });
}

export function useFareAvailabilityQuery(partnerId: string, fareId: string, from: string, to: string) {
    return useQuery({
        queryKey: ["partner-fare-availability", partnerId, fareId, from, to],
        queryFn: () => partnerApi.getFareAvailability(partnerId, fareId, from, to),
        enabled: Boolean(partnerId && fareId),
    });
}

export function useUpsertFareAvailabilityMutation(partnerId: string, fareId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: AvailabilityFormData) => partnerApi.upsertFareAvailability(partnerId, fareId, data),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ["partner-fare-availability", partnerId, fareId] }),
    });
}
export function useRoomAvailabilityQuery(
    partnerId: string,
    roomTypeId: string,
    from: string,
    to: string
) {
    return useQuery({
        queryKey: ["partner-room-availability", partnerId, roomTypeId, from, to],
        queryFn: () => partnerApi.getRoomAvailability(partnerId, roomTypeId, from, to),
        enabled: Boolean(partnerId && roomTypeId),
    });
}

export function useUpsertRoomAvailabilityMutation(partnerId: string, roomTypeId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: RoomAvailabilityFormData) =>
            partnerApi.upsertRoomAvailability(partnerId, roomTypeId, data),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ["partner-room-availability", partnerId, roomTypeId] }),
    });
}
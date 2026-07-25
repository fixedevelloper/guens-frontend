"use client";

import { use } from "react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation"; // ou "next/navigation"

import { RoomForm, RoomFormData } from "@/components/partner/rooms/RoomForm";
import {useAuth} from "../../../../../../../../../context/auth-context";
import {useCreateRoomTypeMutation} from "../../../../../../../../../hooks/use-partner-queries";

interface NewRoomPageProps {
    params: Promise<{ id: string; partnerId?: string }>;
}

export default function NewRoomPage({ params }: NewRoomPageProps) {
    const { id: hotelId } = use(params);
    const router = useRouter();
    const { user } = useAuth();

    // Récupération du partnerId (depuis la route ou le contexte utilisateur/session)

    const createRoomMutation = useCreateRoomTypeMutation(user.partnerId, hotelId);

    const handleCreateRoom = async (data: RoomFormData) => {
        if (!user.partnerId) {
            toast.error("Identifiant partenaire introuvable.");
            return;
        }

        createRoomMutation.mutate(data, {
            onSuccess: () => {
                toast.success("Type de chambre créé avec succès !");
                router.push(`/partner/listings/hotels/${hotelId}/rooms`);
            },
            onError: (error: Error) => {
                toast.error(
                    error.message || "Erreur lors de la création de la chambre."
                );
            },
        });
    };

    return (
        <RoomForm
            hotelId={hotelId}
            onSubmit={handleCreateRoom}
            isLoading={createRoomMutation.isPending}
        />
    );
}
"use client";

import { use } from "react";
import { toast } from "sonner";
import { AlertCircle, Loader2 } from "lucide-react";

import { RoomForm, RoomFormData } from "@/components/partner/rooms/RoomForm";
import { useRouter } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {useRoomTypeQuery, useUpdateRoomTypeMutation} from "../../../../../../../../../../hooks/use-partner-queries";
import {useAuth} from "../../../../../../../../../../context/auth-context";

interface EditRoomPageProps {
    params: Promise<{ id: string; roomId: string; partnerId?: string }>;
}

export default function EditRoomPage({ params }: EditRoomPageProps) {
    const { id: hotelId, roomId } = use(params);
    const router = useRouter();
    const { user } = useAuth();


    // Queries & Mutations
    const {
        data: room,
        isLoading: isFetching,
        isError,
        error,
    } = useRoomTypeQuery(user.partnerId, roomId);

    const updateRoomMutation = useUpdateRoomTypeMutation(user.partnerId, hotelId, roomId);

    const handleUpdateRoom = async (data: RoomFormData) => {
        if (!user.partnerId) {
            toast.error("Identifiant partenaire introuvable.");
            return;
        }

        updateRoomMutation.mutate(data, {
            onSuccess: () => {
                toast.success("Type de chambre mis à jour avec succès !");
                router.push(`/partner/listings/hotels/${hotelId}/rooms`);
            },
            onError: (err: Error) => {
                toast.error(err.message || "Impossible de mettre à jour la chambre.");
            },
        });
    };

    // État de chargement des données de la chambre
    if (isFetching) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="size-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    // État d'erreur si la chambre n'existe pas ou est inaccessible
    if (isError || !room) {
        return (
            <Card className="border-destructive/30 bg-destructive/5 my-6">
                <CardContent className="flex items-center gap-3 py-6 text-destructive">
                    <AlertCircle className="size-5 shrink-0" />
                    <p className="text-sm font-medium">
                        {error instanceof Error
                            ? error.message
                            : "Impossible de charger les informations de cette chambre."}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <RoomForm
            hotelId={hotelId}
            initialData={room}
            isEditing
            onSubmit={handleUpdateRoom}
            isLoading={updateRoomMutation.isPending}
        />
    );
}
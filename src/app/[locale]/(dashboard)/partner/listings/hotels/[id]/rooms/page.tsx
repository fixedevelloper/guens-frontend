"use client";

import React, { use } from "react";
import { HotelRoomsManager } from "@/components/partner/rooms/HotelRoomsManager";
import { useAuth } from "@/context/auth-context";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function HotelRoomsPage({ params }: PageProps) {
    // Déroulement asynchrone des params dans un Client Component (Next.js 15)
    const { id: hotelId } = use(params);
    const { user } = useAuth();

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {user?.partnerId ? (
                <HotelRoomsManager partnerId={user.partnerId} hotelId={hotelId} />
            ) : (
                <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                    Chargement de la session partenaire...
                </div>
            )}
        </div>
    );
}
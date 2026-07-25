"use client";

import { useAuth } from "@/context/auth-context";
import { FlightListings } from "@/components/partner/listings/flight-listings";
import { VehicleListings } from "@/components/partner/listings/vehicle-listings";
import { PropertyListings } from "@/components/partner/listings/property-listings";
import React from "react";
import {HotelListings} from "../../../../../components/partner/listings/hotel-listings";
export const dynamic = "force-dynamic";
export default function PartnerListingsPage() {
    const { user } = useAuth();

    switch (user?.role) {
        case "PARTNER_AIRLINE":
            return <FlightListings partnerId={String(user.partnerId)} />;
        case "PARTNER_HOTEL":
            return <HotelListings partnerId={String(user.partnerId)} />;
        case "PARTNER_CAR_RENTAL":
            return <VehicleListings partnerId={String(user.partnerId)} />;
        case "PARTNER_FURNISHED_RENTAL":
            return <PropertyListings partnerId={String(user.partnerId)} />;
        default:
            return null;
    }
}
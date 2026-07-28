"use client";

import React, { useState } from "react";
import {
    MapPin,
    Calendar,
    Users,
    Search,
    Home,
    Building2,
    BedDouble,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { furnishedRentalSearchParamsToQuery } from "@/lib/search-params";
import { PickLocationAutocomplete } from "@/components/search/pick-location-autocomplete";
import { searchAirportSuggestions } from "@/lib/api/geo";

interface FurnishedRentalFormProps {
    className?: string;
    onSearch?: (searchParams: FurnishedRentalSearchParams) => void;
}

export interface FurnishedRentalSearchParams {
    location: string;
    checkInDate: string;
    checkOutDate: string;
    guests: number;
    bedrooms: string;
    propertyType: string; // 'all' | 'apartment' | 'studio' | 'villa'
    entirePlace: boolean;
}

export function FurnishedRentalForm({
                                        className = "",
                                        onSearch,
                                    }: FurnishedRentalFormProps) {
    const t = useTranslations("FurnishedRental");
    const router = useRouter();

    const today = new Date().toISOString().split("T")[0];
    const defaultCheckOut = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

    const [location, setLocation] = useState("");
    const [checkInDate, setCheckInDate] = useState(today);
    const [checkOutDate, setCheckOutDate] = useState(defaultCheckOut);
    const [guests, setGuests] = useState(2);
    const [bedrooms, setBedrooms] = useState("any");
    const [propertyType, setPropertyType] = useState("all");
    const [entirePlace, setEntirePlace] = useState(true);

    const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newCheckIn = e.target.value;
        setCheckInDate(newCheckIn);
        if (checkOutDate && newCheckIn > checkOutDate) {
            setCheckOutDate(newCheckIn);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const searchData: FurnishedRentalSearchParams = {
            location,
            checkInDate,
            checkOutDate,
            guests,
            bedrooms,
            propertyType,
            entirePlace,
        };

        if (onSearch) {
            onSearch(searchData);
        } else {
            router.push(
                `/furnished-rentals/search?${furnishedRentalSearchParamsToQuery(searchData)}`
            );
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={`w-full rounded-3xl bg-background/95 p-4 sm:p-6 shadow-xl border border-border/60 backdrop-blur-xl ${className}`}
        >
            {/* 1. Filtres rapides */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-5 text-xs sm:text-sm font-medium">
                {/* Logement entier uniquement */}
                <button
                    type="button"
                    onClick={() => setEntirePlace(!entirePlace)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-full border transition-all active:scale-95 ${
                        entirePlace
                            ? "bg-primary/10 border-primary text-primary font-semibold"
                            : "bg-muted/40 border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                >
                    <Home className="size-3.5" />
                    <span>{t("entirePlaceOnly")}</span>
                </button>

                {/* Sélecteur de type de bien */}
                <div className="flex items-center gap-1 p-1 rounded-full bg-muted/40 border border-border/60">
                    {[
                        { id: "all", label: t("typeAll") },
                        { id: "apartment", label: t("typeApartment") },
                        { id: "studio", label: t("typeStudio") },
                        { id: "villa", label: t("typeVilla") },
                    ].map((type) => (
                        <button
                            key={type.id}
                            type="button"
                            onClick={() => setPropertyType(type.id)}
                            className={`px-3 py-1 rounded-full text-xs transition-all ${
                                propertyType === type.id
                                    ? "bg-background text-foreground font-semibold shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Grille principale du formulaire */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-end">
                {/* Destination */}
                <div className="lg:col-span-4 flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="size-3.5 text-primary" />
                        {t("locationLabel")}
                    </label>
                    <div className="relative">
                        <PickLocationAutocomplete
                            icon={<Building2 className="size-4 text-primary" />}
                            label={t("locationLabel")}
                            placeholder={t("locationPlaceholder")}
                            searchPlaceholder={t("locationPlaceholder")}
                            hintLabel={t("locationHint")}
                            noResultsLabel={t("locationNoResults")}
                            initialLabel=""
                            fetchOptions={searchAirportSuggestions}
                            onSelect={(option) => setLocation(option.code)}
                        />
                    </div>
                </div>

                {/* Dates : Arrivée et Départ */}
                <div className="lg:col-span-4 grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                            <Calendar className="size-3.5 text-primary" />
                            {t("checkInLabel")}
                        </label>
                        <input
                            type="date"
                            required
                            min={today}
                            value={checkInDate}
                            onChange={handleCheckInChange}
                            className="w-full h-12 px-3 text-xs sm:text-sm font-medium rounded-2xl bg-muted/30 border border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                            <Calendar className="size-3.5 text-primary" />
                            {t("checkOutLabel")}
                        </label>
                        <input
                            type="date"
                            required
                            min={checkInDate || today}
                            value={checkOutDate}
                            onChange={(e) => setCheckOutDate(e.target.value)}
                            className="w-full h-12 px-3 text-xs sm:text-sm font-medium rounded-2xl bg-muted/30 border border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Voyageurs & Chambres */}
                <div className="lg:col-span-2 grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                            <Users className="size-3.5 text-primary" />
                            {t("guestsLabel")}
                        </label>
                        <select
                            value={guests}
                            onChange={(e) => setGuests(Number(e.target.value))}
                            className="w-full h-12 px-2 text-xs sm:text-sm font-medium rounded-2xl bg-muted/30 border border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-center cursor-pointer"
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 10].map((num) => (
                                <option key={num} value={num}>
                                    {num} {num === 1 ? t("guestSingular") : t("guestPlural")}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                            <BedDouble className="size-3.5 text-primary" />
                            {t("bedroomsLabel")}
                        </label>
                        <select
                            value={bedrooms}
                            onChange={(e) => setBedrooms(e.target.value)}
                            className="w-full h-12 px-1 text-xs sm:text-sm font-medium rounded-2xl bg-muted/30 border border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-center cursor-pointer"
                        >
                            <option value="any">{t("bedroomsAny")}</option>
                            <option value="1">1+</option>
                            <option value="2">2+</option>
                            <option value="3">3+</option>
                            <option value="4">4+</option>
                        </select>
                    </div>
                </div>

                {/* Bouton de soumission */}
                <div className="lg:col-span-2">
                    <button
                        type="submit"
                        className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25 cursor-pointer"
                    >
                        <Search className="size-4" />
                        <span>{t("searchBtn")}</span>
                    </button>
                </div>
            </div>
        </form>
    );
}
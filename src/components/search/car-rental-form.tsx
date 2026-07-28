"use client";

import React, { useState } from "react";
import {
    Calendar,
    Clock,
    Search,
    Car,
    UserCheck,
    ArrowRightLeft,
    Shield,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { carSearchParamsToQuery } from "@/lib/search-params";
import { searchAirportSuggestions } from "@/lib/api/geo";
import { PickLocationAutocomplete } from "@/components/search/pick-location-autocomplete";

interface CarRentalFormProps {
    className?: string;
    onSearch?: (searchParams: CarSearchParams) => void;
}

export interface CarSearchParams {
    pickupLocation: string;
    dropoffLocation: string;
    differentDropoff: boolean;
    pickupDate: string;
    pickupTime: string;
    dropoffDate: string;
    dropoffTime: string;
    withDriver: boolean;
    driverAge25Plus: boolean;
}

export function CarRentalForm({ className = "", onSearch }: CarRentalFormProps) {
    const t = useTranslations("CarRental");
    const router = useRouter();

    const today = new Date().toISOString().split("T")[0];
    const defaultReturn = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

    const [differentDropoff, setDifferentDropoff] = useState(false);
    const [pickupLocation, setPickupLocation] = useState("");
    const [dropoffLocation, setDropoffLocation] = useState("");
    const [pickupDate, setPickupDate] = useState(today);
    const [pickupTime, setPickupTime] = useState("10:00");
    const [dropoffDate, setDropoffDate] = useState(defaultReturn);
    const [dropoffTime, setDropoffTime] = useState("10:00");
    const [withDriver, setWithDriver] = useState(false);
    const [driverAge25Plus, setDriverAge25Plus] = useState(true);

    const handlePickupDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPickup = e.target.value;
        setPickupDate(newPickup);
        if (dropoffDate && newPickup > dropoffDate) {
            setDropoffDate(newPickup);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const searchData: CarSearchParams = {
            pickupLocation,
            dropoffLocation: differentDropoff ? dropoffLocation : pickupLocation,
            differentDropoff,
            pickupDate,
            pickupTime,
            dropoffDate,
            dropoffTime,
            withDriver,
            driverAge25Plus,
        };

        if (onSearch) onSearch(searchData);
        else router.push(`/car-rentals/search?${carSearchParamsToQuery(searchData)}`);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={`w-full rounded-3xl border border-border/60 bg-background/90 p-4 shadow-xl backdrop-blur-xl sm:p-6 ${className}`}
        >
            {/* Options rapides */}
            <div className="mb-5 flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-medium sm:text-sm">
                <button
                    type="button"
                    onClick={() => setDifferentDropoff((v) => !v)}
                    className={`flex items-center gap-2 rounded-full border px-3.5 py-2 transition-all active:scale-95 cursor-pointer ${
                        differentDropoff
                            ? "border-primary bg-primary/10 text-primary font-semibold"
                            : "border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                >
                    <ArrowRightLeft className="size-3.5" />
                    <span>{t("differentDropoff")}</span>
                </button>

                <button
                    type="button"
                    onClick={() => setWithDriver((v) => !v)}
                    className={`flex items-center gap-2 rounded-full border px-3.5 py-2 transition-all active:scale-95 cursor-pointer ${
                        withDriver
                            ? "border-primary bg-primary/10 text-primary font-semibold"
                            : "border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                >
                    <UserCheck className="size-3.5" />
                    <span>{t("withDriver")}</span>
                </button>

                {!withDriver && (
                    <button
                        type="button"
                        onClick={() => setDriverAge25Plus((v) => !v)}
                        className={`flex items-center gap-2 rounded-full border px-3.5 py-2 transition-all active:scale-95 cursor-pointer ${
                            driverAge25Plus
                                ? "border-border/60 bg-muted/60 text-foreground"
                                : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold"
                        }`}
                    >
                        <Shield className="size-3.5" />
                        <span>{driverAge25Plus ? t("driverAgeStandard") : t("driverAgeYoung")}</span>
                    </button>
                )}
            </div>

            {/* Grille principale */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-12 items-end">
                {/* Lieu de prise en charge */}
                <div className={differentDropoff ? "lg:col-span-3" : "lg:col-span-4"}>
                    <PickLocationAutocomplete
                        icon={<Car className="size-4 text-primary" />}
                        label={t("pickupLocationLabel")}
                        placeholder={t("pickupPlaceholder")}
                        searchPlaceholder={t("pickupPlaceholder")}
                        hintLabel={t("locationHint")}
                        noResultsLabel={t("locationNoResults")}
                        initialLabel=""
                        fetchOptions={searchAirportSuggestions}
                        onSelect={(option) => setPickupLocation(option.code)}
                    />
                </div>

                {/* Lieu de restitution (si différent) */}
                {differentDropoff && (
                    <div className="lg:col-span-3">
                        <PickLocationAutocomplete
                            icon={<Car className="size-4 text-primary" />}
                            label={t("dropoffLocationLabel")}
                            placeholder={t("dropoffPlaceholder")}
                            searchPlaceholder={t("dropoffPlaceholder")}
                            hintLabel={t("locationHint")}
                            noResultsLabel={t("locationNoResults")}
                            initialLabel=""
                            fetchOptions={searchAirportSuggestions}
                            onSelect={(option) => setDropoffLocation(option.code)}
                        />
                    </div>
                )}

                {/* Date et heure de prise en charge */}
                <div className="grid grid-cols-3 gap-2 lg:col-span-3">
                    <div className="col-span-2 flex flex-col gap-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                            <Calendar className="size-3.5 text-primary" />
                            {t("pickupDateLabel")}
                        </label>
                        <input
                            type="date"
                            required
                            min={today}
                            value={pickupDate}
                            onChange={handlePickupDateChange}
                            className="h-12 w-full rounded-2xl border border-border/80 bg-muted/30 px-3 text-xs sm:text-sm font-medium outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div className="col-span-1 flex flex-col gap-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                            <Clock className="size-3.5 text-primary" />
                            {t("timeLabel")}
                        </label>
                        <input
                            type="time"
                            required
                            value={pickupTime}
                            onChange={(e) => setPickupTime(e.target.value)}
                            className="h-12 w-full rounded-2xl border border-border/80 bg-muted/30 px-2 text-center text-xs sm:text-sm font-medium outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                        />
                    </div>
                </div>

                {/* Date et heure de restitution */}
                <div className="grid grid-cols-3 gap-2 lg:col-span-3">
                    <div className="col-span-2 flex flex-col gap-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                            <Calendar className="size-3.5 text-primary" />
                            {t("dropoffDateLabel")}
                        </label>
                        <input
                            type="date"
                            required
                            min={pickupDate || today}
                            value={dropoffDate}
                            onChange={(e) => setDropoffDate(e.target.value)}
                            className="h-12 w-full rounded-2xl border border-border/80 bg-muted/30 px-3 text-xs sm:text-sm font-medium outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div className="col-span-1 flex flex-col gap-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                            <Clock className="size-3.5 text-primary" />
                            {t("timeLabel")}
                        </label>
                        <input
                            type="time"
                            required
                            value={dropoffTime}
                            onChange={(e) => setDropoffTime(e.target.value)}
                            className="h-12 w-full rounded-2xl border border-border/80 bg-muted/30 px-2 text-center text-xs sm:text-sm font-medium outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                        />
                    </div>
                </div>

                {/* Bouton de recherche */}
                <div className={differentDropoff ? "lg:col-span-12 mt-2 lg:mt-0" : "lg:col-span-2"}>
                    <button
                        type="submit"
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98] cursor-pointer"
                    >
                        <Search className="size-4" />
                        <span>{t("searchBtn")}</span>
                    </button>
                </div>
            </div>
        </form>
    );
}
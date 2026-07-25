"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Plane,
    Clock,
    Calendar,
    Check,
    Loader2,
    Info,
    AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useCreateFlightMutation } from "@/hooks/use-partner-queries";
import {useAuth} from "../../../../../../../context/auth-context";

// Jours de la semaine (1 = Lundi, 7 = Dimanche) alignés sur Java DayOfWeek
const DAYS_OF_WEEK = [
    { id: 1, short: "Lun", full: "Lundi" },
    { id: 2, short: "Mar", full: "Mardi" },
    { id: 3, short: "Mer", full: "Mercredi" },
    { id: 4, short: "Jeu", full: "Jeudi" },
    { id: 5, short: "Ven", full: "Vendredi" },
    { id: 6, short: "Sam", full: "Samedi" },
    { id: 7, short: "Dim", full: "Dimanche" },
];

const AIRCRAFT_TYPES = [
    "Boeing 737-800",
    "Boeing 777-300ER",
    "Boeing 787 Dreamliner",
    "Airbus A320",
    "Airbus A330-300",
    "Airbus A350-900",
    "ATR 72-600",
    "Embraer E190",
];

export default function NewFlightPage() {
    const router = useRouter();
    const { user } = useAuth();
    // Id du partenaire (à adapter selon votre contexte global ou session)
    const partnerId = user.partnerId;
    const createFlightMutation = useCreateFlightMutation(partnerId);

    // Champs du formulaire
    const [flightNumber, setFlightNumber] = useState("");
    const [aircraftType, setAircraftType] = useState("Airbus A320");
    const [originAirportCode, setOriginAirportCode] = useState("");
    const [destinationAirportCode, setDestinationAirportCode] = useState("");
    const [departureTime, setDepartureTime] = useState("08:00");
    const [arrivalTime, setArrivalTime] = useState("10:30");
    const [durationMinutes, setDurationMinutes] = useState<number>(150);
    const [operatingDays, setOperatingDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);

    // Recalcul automatique de la durée en minutes lors des changements d'horaires
    useEffect(() => {
        if (!departureTime || !arrivalTime) return;

        const [depH, depM] = departureTime.split(":").map(Number);
        const [arrH, arrM] = arrivalTime.split(":").map(Number);

        let depMinutes = depH * 60 + depM;
        let arrMinutes = arrH * 60 + arrM;

        // Prise en compte du vol de nuit (décollage à 23h00, atterrissage à 02h00 J+1)
        if (arrMinutes < depMinutes) {
            arrMinutes += 24 * 60;
        }

        const diff = arrMinutes - depMinutes;
        setDurationMinutes(diff > 0 ? diff : 0);
    }, [departureTime, arrivalTime]);

    const toggleDay = (dayId: number) => {
        setOperatingDays((prev) =>
            prev.includes(dayId)
                ? prev.filter((d) => d !== dayId)
                : [...prev, dayId].sort((a, b) => a - b)
        );
    };

    const toggleSelectAllDays = () => {
        if (operatingDays.length === 7) {
            setOperatingDays([]);
        } else {
            setOperatingDays([1, 2, 3, 4, 5, 6, 7]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const cleanFlightNumber = flightNumber.trim().toUpperCase();
        const cleanOrigin = originAirportCode.trim().toUpperCase();
        const cleanDest = destinationAirportCode.trim().toUpperCase();

        if (!cleanFlightNumber) {
            toast.error("Veuillez saisir le numéro de vol.");
            return;
        }

        if (cleanOrigin.length !== 3 || cleanDest.length !== 3) {
            toast.error("Les codes aéroports doivent respecter le format IATA (exactement 3 lettres).");
            return;
        }

        if (cleanOrigin === cleanDest) {
            toast.error("L'aéroport de départ et de destination ne peuvent pas être identiques.");
            return;
        }

        if (operatingDays.length === 0) {
            toast.error("Veuillez sélectionner au moins un jour de fonctionnement.");
            return;
        }

        // Payload sérialisé pour correspondre au backend Spring Boot (AirlineFlight)
        const payload = {
            partnerId,
            flightNumber: cleanFlightNumber,
            aircraftType,
            originAirportCode: cleanOrigin,
            destinationAirportCode: cleanDest,
            departureTime: `${departureTime}:00`, // Format HH:mm:ss pour LocalTime Java
            arrivalTime: `${arrivalTime}:00`,
            durationMinutes,
            operatingDays,
        };

        try {
            await createFlightMutation.mutateAsync(payload);
            toast.success(`Vol ${cleanFlightNumber} créé avec succès !`);
            router.push("/partner/listings");
        } catch (error: any) {
            console.error("Erreur de création de vol:", error);
            toast.error(
                error?.response?.data?.message || "Échec de la création du vol. Veuillez réessayer."
            );
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            {/* Header & Back Navigation */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            asChild
                            className="size-8 rounded-xl border-border/60"
                        >
                            <Link href="/dashboard/flights">
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                        <span className="text-xs font-semibold text-muted-foreground">
                            Retour à la liste des vols
                        </span>
                    </div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
                        <Plane className="size-6 text-primary" />
                        Nouveau vol régulier
                    </h1>
                </div>
            </div>

            {/* Form Card */}
            <Card className="rounded-2xl border-border/60 shadow-xs">
                <CardHeader className="border-b border-border/40 pb-4">
                    <CardTitle className="text-base font-bold">
                        Informations du plan de vol
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Renseignez les détails d'exploitation, l'itinéraire et les fréquences hebdomadaires.
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 1. Identification & Appareil */}
                        <div className="space-y-3">
                            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                                1. Identification du vol
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="flightNumber" className="text-xs font-bold">
                                        Numéro de vol *
                                    </Label>
                                    <Input
                                        id="flightNumber"
                                        placeholder="Ex: GU 402"
                                        value={flightNumber}
                                        onChange={(e) => setFlightNumber(e.target.value)}
                                        className="rounded-xl text-xs h-10 uppercase font-mono font-semibold"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="aircraftType" className="text-xs font-bold">
                                        Type d'appareil *
                                    </Label>
                                    <Select value={aircraftType} onValueChange={setAircraftType}>
                                        <SelectTrigger className="rounded-xl text-xs h-10">
                                            <SelectValue placeholder="Sélectionner l'appareil" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {AIRCRAFT_TYPES.map((type) => (
                                                <SelectItem key={type} value={type} className="text-xs">
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* 2. Trajet & Codes IATA */}
                        <div className="space-y-3 pt-2">
                            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                                2. Itinéraire
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="originCode" className="text-xs font-bold">
                                        Code IATA Origine *
                                    </Label>
                                    <Input
                                        id="originCode"
                                        placeholder="Ex: DLA"
                                        maxLength={3}
                                        value={originAirportCode}
                                        onChange={(e) => setOriginAirportCode(e.target.value.toUpperCase())}
                                        className="rounded-xl text-xs h-10 uppercase font-mono tracking-widest font-bold"
                                        required
                                    />
                                    <span className="text-[10px] text-muted-foreground">
                                        Code à 3 lettres (ex: DLA pour Douala, CDG pour Paris)
                                    </span>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="destCode" className="text-xs font-bold">
                                        Code IATA Destination *
                                    </Label>
                                    <Input
                                        id="destCode"
                                        placeholder="Ex: NSI"
                                        maxLength={3}
                                        value={destinationAirportCode}
                                        onChange={(e) => setDestinationAirportCode(e.target.value.toUpperCase())}
                                        className="rounded-xl text-xs h-10 uppercase font-mono tracking-widest font-bold"
                                        required
                                    />
                                    <span className="text-[10px] text-muted-foreground">
                                        Code à 3 lettres (ex: NSI pour Yaoundé Nsimalen)
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 3. Horaire & Durée */}
                        <div className="space-y-3 pt-2">
                            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                                3. Horaires & Durée
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="departureTime" className="text-xs font-bold flex items-center gap-1">
                                        <Clock className="size-3.5 text-primary" /> Heure de départ *
                                    </Label>
                                    <Input
                                        id="departureTime"
                                        type="time"
                                        value={departureTime}
                                        onChange={(e) => setDepartureTime(e.target.value)}
                                        className="rounded-xl text-xs h-10"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="arrivalTime" className="text-xs font-bold flex items-center gap-1">
                                        <Clock className="size-3.5 text-primary" /> Heure d'arrivée *
                                    </Label>
                                    <Input
                                        id="arrivalTime"
                                        type="time"
                                        value={arrivalTime}
                                        onChange={(e) => setArrivalTime(e.target.value)}
                                        className="rounded-xl text-xs h-10"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold">Durée calculée</Label>
                                    <div className="h-10 px-3.5 rounded-xl border bg-muted/40 flex items-center justify-between text-xs font-bold">
                                        <span>{durationMinutes} minutes</span>
                                        <span className="text-[11px] font-medium text-muted-foreground">
                                            ({Math.floor(durationMinutes / 60)}h {durationMinutes % 60}m)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. Jours de fonctionnement */}
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Calendar className="size-3.5 text-primary" />
                                    4. Jours d'exploitation hebdomadaire *
                                </h2>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleSelectAllDays}
                                    className="h-6 text-[11px] font-bold text-primary hover:text-primary"
                                >
                                    {operatingDays.length === 7 ? "Tout désélectionner" : "Tous les jours"}
                                </Button>
                            </div>

                            <div className="grid grid-cols-7 gap-2">
                                {DAYS_OF_WEEK.map((day) => {
                                    const isSelected = operatingDays.includes(day.id);
                                    return (
                                        <button
                                            key={day.id}
                                            type="button"
                                            onClick={() => toggleDay(day.id)}
                                            className={cn(
                                                "h-11 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center gap-0.5",
                                                isSelected
                                                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                                    : "bg-muted/20 text-muted-foreground border-border/60 hover:bg-muted/50"
                                            )}
                                        >
                                            <span>{day.short}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Information Banner */}
                        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3.5 flex items-start gap-3">
                            <Info className="size-4 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-900/80 dark:text-blue-200/80 font-medium leading-relaxed">
                                Le vol sera créé avec le statut <strong className="font-bold">ACTIVE</strong> par défaut. Vous pourrez le suspendre ou le modifier ultérieurement depuis le tableau de bord.
                            </p>
                        </div>

                        {/* Form Actions */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
                            <Button
                                type="button"
                                variant="outline"
                                asChild
                                className="rounded-xl text-xs font-bold h-10 px-5"
                            >
                                <Link href="/dashboard/flights">Annuler</Link>
                            </Button>

                            <Button
                                type="submit"
                                disabled={createFlightMutation.isPending}
                                className="rounded-xl text-xs font-bold h-10 px-6 gap-2 bg-primary text-primary-foreground shadow-xs"
                            >
                                {createFlightMutation.isPending ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Création en cours...
                                    </>
                                ) : (
                                    <>
                                        <Check className="size-4" />
                                        Enregistrer le vol
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
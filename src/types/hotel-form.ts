import { Wifi, Waves, Car, Utensils, AirVent, Tv, Coffee, Building2, MapPin, Sparkles, ShieldCheck } from "lucide-react";

export interface HotelFormData {
    name: string;
    starRating: number;
    coverImageUrl: string;
    description: string;
    city: string;
    country: string;
    address: string;
    phone: string;
    email: string;
    checkInTime: string;
    checkOutTime: string;
    amenities: string[];
}

export const AMENITIES_OPTIONS = [
    { id: "wifi", label: "Wi-Fi Gratuit", icon: Wifi },
    { id: "pool", label: "Piscine", icon: Waves },
    { id: "parking", label: "Parking sécurisé", icon: Car },
    { id: "restaurant", label: "Restaurant", icon: Utensils },
    { id: "ac", label: "Climatisation", icon: AirVent },
    { id: "tv", label: "Télévision / TV HD", icon: Tv },
    { id: "breakfast", label: "Petit-déjeuner inclus", icon: Coffee },
];

export const FORM_STEPS = [
    { id: 1, title: "Général", description: "Nom et classement", icon: Building2 },
    { id: 2, title: "Localisation", description: "Adresse et contact", icon: MapPin },
    { id: 3, title: "Équipements", description: "Services & options", icon: Sparkles },
    { id: 4, title: "Validation", description: "Récapitulatif final", icon: ShieldCheck },
];
export interface UserImage {
    id: string;
    url: string;
    name: string;
    size?: string;
    createdAt?: string;
}
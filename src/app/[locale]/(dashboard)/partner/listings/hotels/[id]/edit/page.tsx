"use client";

import { use, useState } from "react";
import { useTranslations } from "next-intl";
import {
    ArrowLeft,
    Save,
    Building2,
    MapPin,
    Sparkles,
    Clock,
    Loader2,
    Check,
    Star,
    Globe,
    Mail,
    Phone,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface PageProps {
    params: Promise<{
        locale: string;
        id: string;
    }>;
}

export default function EditHotelPage({ params }: PageProps) {
    const { id } = use(params);
    const t = useTranslations("EditHotel");

    const [isSaving, setIsSaving] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Modèle de données initial pour l'édition de l'hôtel
    const [formData, setFormData] = useState({
        name: "Hôtel Le Grand Palais",
        slug: "hotel-le-grand-palais",
        description:
            "Un établissement d'exception situé au cœur de la ville, offrant des prestations haut de gamme, une piscine panoramique et un service client irréprochable.",
        starRating: "5",
        status: "published",
        email: "contact@grandpalais.com",
        phone: "+33 1 42 68 55 00",
        website: "https://grandpalais.com",
        // Adresse
        address: "15 Avenue des Champs-Élysées",
        city: "Paris",
        country: "France",
        postalCode: "75008",
        latitude: "48.8698",
        longitude: "2.3075",
        // Politiques
        checkInTime: "15:00",
        checkOutTime: "11:00",
        cancelPolicy: "flexible",
        // Équipements
        amenities: {
            wifi: true,
            pool: true,
            parking: true,
            spa: true,
            restaurant: true,
            gym: true,
            petFriendly: false,
            airConditioning: true,
        },
    });

    const handleInputChange = (
        field: string,
        value: string | boolean | Record<string, boolean>
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleAmenityToggle = (key: string, checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            amenities: {
                ...prev.amenities,
                [key]: checked,
            },
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setIsSuccess(false);

        // Simulation de la requête backend (ex: PUT /api/hotels/[hotelId])
        setTimeout(() => {
            setIsSaving(false);
            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 3000);
        }, 1000);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* HEADER & ACTIONS */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        asChild
                        className="rounded-xl size-9 shrink-0"
                    >
                        <Link href={`/listings/hotels`}>
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-black tracking-tight sm:text-xl">
                                {formData.name || (t("title") ?? "Éditer l'hôtel")}
                            </h1>
                            <Badge
                                variant={formData.status === "published" ? "default" : "secondary"}
                                className="rounded-lg text-[10px] font-bold uppercase tracking-wider"
                            >
                                {formData.status}
                            </Badge>
                        </div>
                        <p className="text-xs font-semibold text-muted-foreground">
                            ID : <span className="font-mono text-foreground">{id}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        asChild
                        className="rounded-xl font-bold text-xs h-9 px-4"
                    >
                        <Link href={`/partner/listings/hotels/${id}/images`}>
                            Gérer les images
                        </Link>
                    </Button>

                    <Button
                        type="submit"
                        disabled={isSaving}
                        className="rounded-xl font-bold text-xs h-9 px-4 gap-2"
                    >
                        {isSaving ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : isSuccess ? (
                            <Check className="size-4 text-emerald-400" />
                        ) : (
                            <Save className="size-4" />
                        )}
                        <span>
              {isSaving
                  ? "Enregistrement..."
                  : isSuccess
                      ? "Enregistré !"
                      : "Enregistrer"}
            </span>
                    </Button>
                </div>
            </div>

            {/* ONGLET DE NAVIGATION DE L'ÉDITION */}
            <Tabs defaultValue="general" className="w-full space-y-6">
                <TabsList className="bg-muted/60 p-1 rounded-2xl h-auto grid grid-cols-2 sm:grid-cols-4 gap-1">
                    <TabsTrigger
                        value="general"
                        className="rounded-xl text-xs font-bold gap-2 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-xs"
                    >
                        <Building2 className="size-3.5" />
                        <span>Général</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="location"
                        className="rounded-xl text-xs font-bold gap-2 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-xs"
                    >
                        <MapPin className="size-3.5" />
                        <span>Emplacement</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="amenities"
                        className="rounded-xl text-xs font-bold gap-2 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-xs"
                    >
                        <Sparkles className="size-3.5" />
                        <span>Équipements</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="policies"
                        className="rounded-xl text-xs font-bold gap-2 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-xs"
                    >
                        <Clock className="size-3.5" />
                        <span>Politiques</span>
                    </TabsTrigger>
                </TabsList>

                {/* 1. INFORMATIONS GÉNÉRALES */}
                <TabsContent value="general" className="space-y-4">
                    <Card className="rounded-2xl border-border/60">
                        <CardHeader>
                            <CardTitle className="text-sm font-extrabold">
                                Informations Principales
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Définissez le nom, la description et la visibilité de l'hôtel.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="name" className="text-xs font-bold">
                                        Nom de l'établissement
                                    </Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                        className="rounded-xl text-xs h-10"
                                        placeholder="ex: Hôtel Le Grand"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="slug" className="text-xs font-bold">
                                        Slug URL
                                    </Label>
                                    <Input
                                        id="slug"
                                        value={formData.slug}
                                        onChange={(e) => handleInputChange("slug", e.target.value)}
                                        className="rounded-xl text-xs h-10 font-mono"
                                        placeholder="hotel-le-grand"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="description" className="text-xs font-bold">
                                    Description détaillée
                                </Label>
                                <Textarea
                                    id="description"
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) =>
                                        handleInputChange("description", e.target.value)
                                    }
                                    className="rounded-xl text-xs resize-none"
                                    placeholder="Décrivez les atouts de votre hôtel..."
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold flex items-center gap-1">
                                        <Star className="size-3.5 text-amber-500 fill-amber-500" />
                                        Classement (Étoiles)
                                    </Label>
                                    <Select
                                        value={formData.starRating}
                                        onValueChange={(val) => handleInputChange("starRating", val)}
                                    >
                                        <SelectTrigger className="rounded-xl text-xs h-10">
                                            <SelectValue placeholder="Sélectionner" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="1">1 Étoile</SelectItem>
                                            <SelectItem value="2">2 Étoiles</SelectItem>
                                            <SelectItem value="3">3 Étoiles</SelectItem>
                                            <SelectItem value="4">4 Étoiles</SelectItem>
                                            <SelectItem value="5">5 Étoiles (Luxe)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold">Statut de la fiche</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(val) => handleInputChange("status", val)}
                                    >
                                        <SelectTrigger className="rounded-xl text-xs h-10">
                                            <SelectValue placeholder="Choisir un statut" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="published">Publié</SelectItem>
                                            <SelectItem value="draft">Brouillon</SelectItem>
                                            <SelectItem value="archived">Archivé</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-border/60">
                        <CardHeader>
                            <CardTitle className="text-sm font-extrabold">Coordonnées & Contact</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold flex items-center gap-1">
                                    <Mail className="size-3.5 text-muted-foreground" /> Email
                                </Label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                    className="rounded-xl text-xs h-10"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold flex items-center gap-1">
                                    <Phone className="size-3.5 text-muted-foreground" /> Téléphone
                                </Label>
                                <Input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange("phone", e.target.value)}
                                    className="rounded-xl text-xs h-10"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold flex items-center gap-1">
                                    <Globe className="size-3.5 text-muted-foreground" /> Site Web
                                </Label>
                                <Input
                                    type="url"
                                    value={formData.website}
                                    onChange={(e) => handleInputChange("website", e.target.value)}
                                    className="rounded-xl text-xs h-10"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 2. EMPLACEMENT */}
                <TabsContent value="location" className="space-y-4">
                    <Card className="rounded-2xl border-border/60">
                        <CardHeader>
                            <CardTitle className="text-sm font-extrabold">Adresse Géographique</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold">Adresse complète</Label>
                                <Input
                                    value={formData.address}
                                    onChange={(e) => handleInputChange("address", e.target.value)}
                                    className="rounded-xl text-xs h-10"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold">Ville</Label>
                                    <Input
                                        value={formData.city}
                                        onChange={(e) => handleInputChange("city", e.target.value)}
                                        className="rounded-xl text-xs h-10"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold">Code Postal</Label>
                                    <Input
                                        value={formData.postalCode}
                                        onChange={(e) => handleInputChange("postalCode", e.target.value)}
                                        className="rounded-xl text-xs h-10 font-mono"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold">Pays</Label>
                                    <Input
                                        value={formData.country}
                                        onChange={(e) => handleInputChange("country", e.target.value)}
                                        className="rounded-xl text-xs h-10"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold">Latitude</Label>
                                    <Input
                                        value={formData.latitude}
                                        onChange={(e) => handleInputChange("latitude", e.target.value)}
                                        className="rounded-xl text-xs h-10 font-mono"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold">Longitude</Label>
                                    <Input
                                        value={formData.longitude}
                                        onChange={(e) => handleInputChange("longitude", e.target.value)}
                                        className="rounded-xl text-xs h-10 font-mono"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 3. ÉQUIPEMENTS & SERVICES */}
                <TabsContent value="amenities" className="space-y-4">
                    <Card className="rounded-2xl border-border/60">
                        <CardHeader>
                            <CardTitle className="text-sm font-extrabold">Services & Équipements</CardTitle>
                            <CardDescription className="text-xs">
                                Cochez les équipements disponibles dans cet établissement.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { key: "wifi", label: "Wi-Fi Gratuit" },
                                { key: "pool", label: "Piscine" },
                                { key: "parking", label: "Parking Privé" },
                                { key: "spa", label: "Spa & Bien-être" },
                                { key: "restaurant", label: "Restaurant" },
                                { key: "gym", label: "Salle de Sport" },
                                { key: "petFriendly", label: "Animaux Acceptés" },
                                { key: "airConditioning", label: "Climatisation" },
                            ].map((item) => (
                                <div
                                    key={item.key}
                                    className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-card hover:border-border transition-colors"
                                >
                                    <Label htmlFor={item.key} className="text-xs font-bold cursor-pointer">
                                        {item.label}
                                    </Label>
                                    <Switch
                                        id={item.key}
                                        checked={
                                            formData.amenities[item.key as keyof typeof formData.amenities]
                                        }
                                        onCheckedChange={(checked) => handleAmenityToggle(item.key, checked)}
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 4. POLITIQUES DE L'HÔTEL */}
                <TabsContent value="policies" className="space-y-4">
                    <Card className="rounded-2xl border-border/60">
                        <CardHeader>
                            <CardTitle className="text-sm font-extrabold">Horaires & Annulation</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold">Heure d'arrivée (Check-in)</Label>
                                <Input
                                    type="time"
                                    value={formData.checkInTime}
                                    onChange={(e) => handleInputChange("checkInTime", e.target.value)}
                                    className="rounded-xl text-xs h-10"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold">Heure de départ (Check-out)</Label>
                                <Input
                                    type="time"
                                    value={formData.checkOutTime}
                                    onChange={(e) => handleInputChange("checkOutTime", e.target.value)}
                                    className="rounded-xl text-xs h-10"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold">Politique d'annulation</Label>
                                <Select
                                    value={formData.cancelPolicy}
                                    onValueChange={(val) => handleInputChange("cancelPolicy", val)}
                                >
                                    <SelectTrigger className="rounded-xl text-xs h-10">
                                        <SelectValue placeholder="Choisir" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="flexible">Flexible (24h avant)</SelectItem>
                                        <SelectItem value="moderate">Modérée (5 jours avant)</SelectItem>
                                        <SelectItem value="strict">Stricte (Non-remboursable)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </form>
    );
}
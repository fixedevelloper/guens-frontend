"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    ChevronRight,
    Check,
    Loader2,
    Home,
    MapPin,
    DollarSign,
    Sparkles,
    Bed,
    Bath,
    Users,
    Moon,
    Image as ImageIcon,
    UploadCloud,
    Trash2,
    RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { useAuth } from "@/context/auth-context";
import { useCreatePropertyMutation } from "@/hooks/use-partner-queries";

import { cn } from "@/lib/utils";
import { PROPERTY_AMENITIES, PropertyFormData, PropertyType } from "../../../../../../../lib/api/types";
import {ImageSelectModal} from "../../../../../../../components/partner/media/ImageSelectModal";

// Interface locale pour gérer la valeur de saisie du prix et l'image de couverture
interface LocalPropertyFormState extends Omit<PropertyFormData, "pricePerNight"> {
    pricePerNight: number | "";
    coverImage: string;
}

// Configuration des étapes du Stepper
const FORM_STEPS = [
    { id: 1, title: "Général", icon: Home },
    { id: 2, title: "Localisation", icon: MapPin },
    { id: 3, title: "Capacité & Tarifs", icon: DollarSign },
    { id: 4, title: "Équipements", icon: Sparkles },
    { id: 5, title: "Couverture", icon: ImageIcon },
];

export default function NewPropertyPage() {
    const router = useRouter();
    const { user } = useAuth();

    const partnerId = user?.partnerId ?? "";
    const createPropertyMutation = useCreatePropertyMutation(partnerId);

    const [currentStep, setCurrentStep] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // État local initialisé avec des valeurs réelles par défaut
    const [form, setForm] = useState<LocalPropertyFormState>({
        title: "",
        propertyType: "APARTMENT",
        address: "",
        city: "Douala",
        country: "Cameroun",
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 2,
        amenities: ["WIFI", "AIR_CONDITIONING"],
        pricePerNight: "",
        currency: "XAF",
        minStayNights: 1,
        description: "",
        coverImage: "",
    });

    const isSubmitting = createPropertyMutation.isPending;

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
        const { name, value, type } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
        }));
    }

    function handleSelectChange(name: keyof LocalPropertyFormState, value: string) {
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    function toggleAmenity(id: string) {
        setForm((prev) => ({
            ...prev,
            amenities: prev.amenities.includes(id)
                ? prev.amenities.filter((item) => item !== id)
                : [...prev.amenities, id],
        }));
    }

    // Callback déclenché lors de la sélection de l'image depuis la modale
    function handleSelectImage(imageUrl: string) {
        setForm((prev) => ({
            ...prev,
            coverImage: imageUrl,
        }));
        setIsModalOpen(false);
        toast.success("Photo de couverture mise à jour !");
    }

    function handleRemoveCoverImage() {
        setForm((prev) => ({ ...prev, coverImage: "" }));
    }

    function nextStep() {
        // Validation dynamique par étape
        if (currentStep === 1) {
            if (!form.title.trim() || form.title.length < 3) {
                toast.error("Veuillez renseigner un titre d'au moins 3 caractères.");
                return;
            }
        }

        if (currentStep === 2) {
            if (!form.address.trim()) {
                toast.error("L'adresse ou le quartier est obligatoire.");
                return;
            }
            if (!form.city.trim()) {
                toast.error("La ville est obligatoire.");
                return;
            }
        }

        if (currentStep === 3) {
            if (!form.pricePerNight || Number(form.pricePerNight) <= 0) {
                toast.error("Veuillez indiquer un prix par nuit valide.");
                return;
            }
            if (Number(form.maxGuests) < 1) {
                toast.error("La capacité maximale doit être d'au moins 1 personne.");
                return;
            }
        }

        if (currentStep === 5) {
            if (!form.coverImage) {
                toast.error("Veuillez sélectionner une photo de couverture pour la résidence.");
                return;
            }
        }

        if (currentStep < FORM_STEPS.length) {
            setCurrentStep((prev) => prev + 1);
        }
    }

    function prevStep() {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!partnerId) {
            toast.error("Identifiant partenaire introuvable. Veuillez vous reconnecter.");
            return;
        }

        if (!form.coverImage) {
            toast.error("La photo de couverture est requise.");
            setCurrentStep(5);
            return;
        }

        // Normalisation du payload réel pour le backend
        const payload: PropertyFormData & { coverImage?: string } = {
            ...form,
            pricePerNight: Number(form.pricePerNight) || 0,
            bedrooms: Number(form.bedrooms) || 0,
            bathrooms: Number(form.bathrooms) || 1,
            maxGuests: Number(form.maxGuests) || 1,
            minStayNights: Number(form.minStayNights) || 1,
        };

        try {
            await createPropertyMutation.mutateAsync(payload);
            toast.success("Résidence meublée créée avec succès !");
            router.push("/partner/listings");
        } catch (error: any) {
            console.error("Erreur lors de la création de la résidence:", error);
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Impossible de créer la résidence meublée pour le moment."
            );
        }
    }

    return (
        <div className="mx-auto max-w-3xl space-y-8 py-6 px-4">
            {/* En-tête */}
            <div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="mb-2 gap-1.5 text-muted-foreground hover:text-foreground rounded-xl"
                >
                    <ChevronLeft className="size-4" />
                    Retour aux hébergements
                </Button>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                    Ajouter une résidence meublée
                </h1>
                <p className="text-xs font-semibold text-muted-foreground mt-1">
                    Inscrivez un appartement, une villa ou un studio pour la location courte/moyenne durée.
                </p>
            </div>

            {/* Stepper Visuel */}
            <PropertyStepper currentStep={currentStep} onStepClick={setCurrentStep} />

            {/* Formulaire Conteneur */}
            <Card className="border border-border/60 shadow-sm rounded-2xl overflow-hidden bg-card">
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* ÉTAPE 1 : INFORMATIONS GÉNÉRALES */}
                        {currentStep === 1 && (
                            <div className="space-y-4 animate-in fade-in-50 duration-200">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-xs font-bold">
                                        Titre de l'annonce *
                                    </Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        placeholder="Ex: Appartement de Luxe vue sur Mer - Bonanjo"
                                        value={form.title}
                                        onChange={handleChange}
                                        className="rounded-xl text-xs h-10"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="propertyType" className="text-xs font-bold">
                                        Type d'hébergement *
                                    </Label>
                                    <Select
                                        value={form.propertyType}
                                        onValueChange={(val) => handleSelectChange("propertyType", val as PropertyType)}
                                    >
                                        <SelectTrigger id="propertyType" className="rounded-xl text-xs h-10">
                                            <SelectValue placeholder="Sélectionnez le type" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="APARTMENT">Appartement</SelectItem>
                                            <SelectItem value="HOUSE">Maison</SelectItem>
                                            <SelectItem value="VILLA">Villa</SelectItem>
                                            <SelectItem value="STUDIO">Studio</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-xs font-bold">
                                        Description du logement
                                    </Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        placeholder="Décrivez les atouts, le quartier et l'ambiance de votre hébergement..."
                                        value={form.description}
                                        onChange={handleChange}
                                        rows={5}
                                        className="rounded-xl text-xs resize-none"
                                        maxLength={2000}
                                    />
                                    <p className="text-[10px] text-muted-foreground text-right">
                                        {form.description.length}/2000 caractères
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ÉTAPE 2 : LOCALISATION */}
                        {currentStep === 2 && (
                            <div className="space-y-4 animate-in fade-in-50 duration-200">
                                <div className="space-y-2">
                                    <Label htmlFor="address" className="text-xs font-bold">
                                        Adresse ou Quartier *
                                    </Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        placeholder="Ex: Boulevard de la Liberté, Akwa"
                                        value={form.address}
                                        onChange={handleChange}
                                        className="rounded-xl text-xs h-10"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city" className="text-xs font-bold">
                                            Ville *
                                        </Label>
                                        <Input
                                            id="city"
                                            name="city"
                                            placeholder="Ex: Douala"
                                            value={form.city}
                                            onChange={handleChange}
                                            className="rounded-xl text-xs h-10"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="country" className="text-xs font-bold">
                                            Pays *
                                        </Label>
                                        <Input
                                            id="country"
                                            name="country"
                                            placeholder="Ex: Cameroun"
                                            value={form.country}
                                            onChange={handleChange}
                                            className="rounded-xl text-xs h-10"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ÉTAPE 3 : CAPACITÉ & TARIFICATION */}
                        {currentStep === 3 && (
                            <div className="space-y-6 animate-in fade-in-50 duration-200">
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="bedrooms" className="text-xs font-bold flex items-center gap-1.5">
                                            <Bed className="size-3.5 text-primary" /> Chambres
                                        </Label>
                                        <Input
                                            id="bedrooms"
                                            name="bedrooms"
                                            type="number"
                                            min={0}
                                            value={form.bedrooms}
                                            onChange={handleChange}
                                            className="rounded-xl text-xs h-10"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bathrooms" className="text-xs font-bold flex items-center gap-1.5">
                                            <Bath className="size-3.5 text-primary" /> Salles de bain
                                        </Label>
                                        <Input
                                            id="bathrooms"
                                            name="bathrooms"
                                            type="number"
                                            min={1}
                                            value={form.bathrooms}
                                            onChange={handleChange}
                                            className="rounded-xl text-xs h-10"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="maxGuests" className="text-xs font-bold flex items-center gap-1.5">
                                            <Users className="size-3.5 text-primary" /> Max. Hôtes
                                        </Label>
                                        <Input
                                            id="maxGuests"
                                            name="maxGuests"
                                            type="number"
                                            min={1}
                                            value={form.maxGuests}
                                            onChange={handleChange}
                                            className="rounded-xl text-xs h-10"
                                        />
                                    </div>
                                </div>

                                <hr className="border-border/40" />

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="sm:col-span-2 space-y-2">
                                        <Label htmlFor="pricePerNight" className="text-xs font-bold">
                                            Prix par nuit *
                                        </Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="pricePerNight"
                                                name="pricePerNight"
                                                type="number"
                                                min={0}
                                                placeholder="Ex: 50000"
                                                value={form.pricePerNight}
                                                onChange={handleChange}
                                                className="rounded-xl text-xs h-10 flex-1"
                                                required
                                            />
                                            <Select
                                                value={form.currency}
                                                onValueChange={(val) => handleSelectChange("currency", val)}
                                            >
                                                <SelectTrigger className="w-24 rounded-xl text-xs h-10">
                                                    <SelectValue placeholder="Devise" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl">
                                                    <SelectItem value="XAF">XAF</SelectItem>
                                                    <SelectItem value="EUR">EUR (€)</SelectItem>
                                                    <SelectItem value="USD">USD ($)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="minStayNights" className="text-xs font-bold flex items-center gap-1.5">
                                            <Moon className="size-3.5 text-primary" /> Séjour min (nuits)
                                        </Label>
                                        <Input
                                            id="minStayNights"
                                            name="minStayNights"
                                            type="number"
                                            min={1}
                                            value={form.minStayNights}
                                            onChange={handleChange}
                                            className="rounded-xl text-xs h-10"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ÉTAPE 4 : ÉQUIPEMENTS & COMMODITÉS RÉELLES */}
                        {currentStep === 4 && (
                            <div className="space-y-4 animate-in fade-in-50 duration-200">
                                <div>
                                    <h3 className="text-xs font-bold mb-1">Équipements inclus</h3>
                                    <p className="text-[11px] text-muted-foreground">
                                        Sélectionnez les commodités mises à disposition des clients.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                                    {PROPERTY_AMENITIES.map((amenity) => {
                                        const isSelected = form.amenities.includes(amenity.id);
                                        return (
                                            <button
                                                key={amenity.id}
                                                type="button"
                                                onClick={() => toggleAmenity(amenity.id)}
                                                className={cn(
                                                    "flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all text-left",
                                                    isSelected
                                                        ? "border-primary bg-primary/10 text-primary"
                                                        : "border-border/60 hover:bg-muted/50 text-muted-foreground"
                                                )}
                                            >
                                                <span>{amenity.label}</span>
                                                {isSelected && <Check className="size-4 shrink-0 text-primary" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ÉTAPE 5 : IMAGE DE COUVERTURE AVEC MODALE */}
                        {currentStep === 5 && (
                            <div className="space-y-4 animate-in fade-in-50 duration-200">
                                <div>
                                    <h3 className="text-xs font-bold mb-1">Image de couverture *</h3>
                                    <p className="text-[11px] text-muted-foreground">
                                        Sélectionnez une photo attrayante depuis votre galerie pour illustrer votre résidence.
                                    </p>
                                </div>

                                {form.coverImage ? (
                                    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border/80 bg-muted group shadow-xs">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={form.coverImage}
                                            alt="Couverture de la résidence"
                                            className="h-full w-full object-cover"
                                        />
                                        <div className="absolute top-3 right-3 flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                className="h-8 gap-1.5 rounded-xl text-xs font-bold shadow-md bg-white/90 hover:bg-white text-foreground backdrop-blur-xs"
                                                onClick={() => setIsModalOpen(true)}
                                            >
                                                <RefreshCw className="size-3.5" />
                                                Changer
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="h-8 w-8 rounded-xl shadow-md"
                                                onClick={handleRemoveCoverImage}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-lg">
                                            Photo de couverture principale
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(true)}
                                        className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-border/80 hover:border-primary/50 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer text-center group"
                                    >
                                        <div className="p-3 bg-primary/10 rounded-full text-primary mb-3 group-hover:scale-110 transition-transform">
                                            <UploadCloud className="size-6" />
                                        </div>
                                        <span className="text-xs font-bold">Sélectionner l'image de couverture</span>
                                        <span className="text-[10px] text-muted-foreground mt-1">
                                            Ouvre la galerie pour choisir ou téléverser l'image principale
                                        </span>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* NAVIGATION ENTRE ÉTAPES */}
                        <div className="flex items-center justify-between pt-6 border-t border-border/60">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={currentStep === 1 || isSubmitting}
                                onClick={prevStep}
                                className="gap-1.5 rounded-xl text-xs font-bold h-9"
                            >
                                <ChevronLeft className="size-4" />
                                Précédent
                            </Button>

                            {currentStep < FORM_STEPS.length ? (
                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    className="gap-1.5 rounded-xl text-xs font-bold h-9 shadow-sm"
                                >
                                    Suivant
                                    <ChevronRight className="size-4" />
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="gap-2 rounded-xl text-xs font-bold h-9 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" />
                                            Création en cours...
                                        </>
                                    ) : (
                                        <>
                                            Créer le logement
                                            <Check className="size-4" />
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Modale de sélection d'image */}
            <ImageSelectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelectImage={handleSelectImage}
                title="Sélectionner la couverture de la résidence"
            />
        </div>
    );
}

// Composant Stepper
function PropertyStepper({
                             currentStep,
                             onStepClick,
                         }: {
    currentStep: number;
    onStepClick: (step: number) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-1 sm:gap-2 border border-border/60 p-2 rounded-2xl bg-card overflow-x-auto">
            {FORM_STEPS.map((step) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                    <button
                        key={step.id}
                        type="button"
                        onClick={() => isCompleted && onStepClick(step.id)}
                        disabled={!isCompleted && !isActive}
                        className={cn(
                            "flex flex-1 items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all shrink-0",
                            isActive
                                ? "bg-primary text-primary-foreground shadow-xs"
                                : isCompleted
                                ? "bg-muted text-foreground hover:bg-muted/80 cursor-pointer"
                                : "text-muted-foreground opacity-50 cursor-not-allowed"
                        )}
                    >
                        <Icon className="size-3.5 shrink-0" />
                        <span className="hidden md:inline">{step.title}</span>
                        <span className="md:hidden">{step.id}</span>
                    </button>
                );
            })}
        </div>
    );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HotelFormData, FORM_STEPS } from "@/types/hotel-form";
import { HotelStepper } from "@/components/partner/hotels/HotelStepper";
import { StepGeneralInfo } from "@/components/partner/hotels/steps/StepGeneralInfo";
import { StepLocationContact } from "@/components/partner/hotels/steps/StepLocationContact";
import { StepAmenitiesPolicies } from "@/components/partner/hotels/steps/StepAmenitiesPolicies";
import { StepSummaryValidation } from "@/components/partner/hotels/steps/StepSummaryValidation";

import { useAuth } from "@/context/auth-context";
import { useCreateHotel } from "@/hooks/use-partner-queries";

export default function NewHotelPage() {
    const router = useRouter();
    const { user } = useAuth();
    const createHotelMutation = useCreateHotel();

    const [currentStep, setCurrentStep] = useState(1);

    const [form, setForm] = useState<HotelFormData>({
        name: "",
        starRating: 3,
        coverImageUrl: "",
        description: "",
        address: "",
        city: "",
        country: "Cameroun",
        phone: "",
        email: "",
        checkInTime: "14:00",
        checkOutTime: "12:00",
        amenities: [],
    });

    const isSubmitting = createHotelMutation.isPending;

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    function handleStarChange(rating: number) {
        setForm((prev) => ({ ...prev, starRating: rating }));
    }

    function handleCoverImageChange(url: string) {
        setForm((prev) => ({ ...prev, coverImageUrl: url }));
    }

    function toggleAmenity(id: string) {
        setForm((prev) => ({
            ...prev,
            amenities: prev.amenities.includes(id)
                ? prev.amenities.filter((item) => item !== id)
                : [...prev.amenities, id],
        }));
    }

    function nextStep() {
        if (currentStep < FORM_STEPS.length) setCurrentStep((prev) => prev + 1);
    }

    function prevStep() {
        if (currentStep > 1) setCurrentStep((prev) => prev - 1);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const partnerId = user?.partnerId;

        if (!partnerId) {
            toast.error("Identifiant partenaire introuvable. Veuillez vous reconnecter.");
            return;
        }

        try {
            // Fix de la clé/valeur partnerId dans le payload
            await createHotelMutation.mutateAsync({ partnerId, data: form });
            toast.success("Établissement créé avec succès !");
            router.push("/partner/listings");
        } catch (error: any) {
            console.error("Erreur lors de la création de l'hôtel:", error);
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Une erreur est survenue lors de la création de l'établissement."
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
                    className="mb-2 gap-1.5 text-muted-foreground hover:text-foreground"
                >
                    <ChevronLeft className="size-4" />
                    Retour aux établissements
                </Button>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Ajouter un hôtel</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Complétez les étapes ci-dessous pour inscrire votre établissement sur la plateforme.
                </p>
            </div>

            {/* Stepper */}
            <HotelStepper currentStep={currentStep} />

            {/* Formulaire */}
            <Card className="border shadow-sm">
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {currentStep === 1 && (
                            <StepGeneralInfo
                                form={form}
                                onChange={handleChange}
                                onStarChange={handleStarChange}
                                onCoverImageChange={handleCoverImageChange}
                            />
                        )}

                        {currentStep === 2 && (
                            <StepLocationContact
                                form={form}
                                onChange={handleChange}
                            />
                        )}

                        {currentStep === 3 && (
                            <StepAmenitiesPolicies
                                form={form}
                                onChange={handleChange}
                                onToggleAmenity={toggleAmenity}
                            />
                        )}

                        {currentStep === 4 && (
                            <StepSummaryValidation form={form} />
                        )}

                        {/* Navigation entre étapes */}
                        <div className="flex items-center justify-between pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={currentStep === 1 || isSubmitting}
                                onClick={prevStep}
                                className="gap-1.5 rounded-xl"
                            >
                                <ChevronLeft className="size-4" />
                                Précédent
                            </Button>

                            {currentStep < FORM_STEPS.length ? (
                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    className="gap-1.5 rounded-xl shadow-sm"
                                >
                                    Suivant
                                    <ChevronRight className="size-4" />
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" />
                                            Création en cours...
                                        </>
                                    ) : (
                                        <>
                                            Créer mon établissement
                                            <Check className="size-4" />
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
import { ShieldCheck, MapPin, Star, Phone, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { HotelFormData, AMENITIES_OPTIONS } from "@/types/hotel-form";

interface StepSummaryValidationProps {
    form: HotelFormData;
}

export function StepSummaryValidation({ form }: StepSummaryValidationProps) {
    return (
        <div className="space-y-5 animate-in fade-in-50 duration-200">
            <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <ShieldCheck className="size-5 text-emerald-600" />
                    Vérification de la fiche
                </h3>
                <p className="text-xs text-muted-foreground">
                    Vérifiez les informations saisies avant de créer l'établissement.
                </p>
            </div>

            <div className="rounded-xl border bg-muted/20 p-4 space-y-4">
                {form.coverImageUrl && (
                    <div className="relative h-40 w-full overflow-hidden rounded-lg">
                        <img
                            src={form.coverImageUrl}
                            alt="Couverture de l'hôtel"
                            className="h-full w-full object-cover"
                        />
                    </div>
                )}

                <div className="flex justify-between items-start border-b pb-3">
                    <div>
                        <h4 className="font-bold text-base text-foreground">{form.name || "Nom non spécifié"}</h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="size-3" /> {form.city}, {form.country} — {form.address}
                        </p>
                    </div>
                    <Badge variant="secondary" className="gap-1 bg-amber-500/10 text-amber-600">
                        {form.starRating} <Star className="size-3 fill-amber-400 text-amber-400" />
                    </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                        <span className="text-muted-foreground block">Contact Téléphone</span>
                        <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                            <Phone className="size-3 text-primary" /> {form.phone || "—"}
                        </span>
                    </div>
                    <div>
                        <span className="text-muted-foreground block">Email de réception</span>
                        <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                            <Mail className="size-3 text-primary" /> {form.email || "—"}
                        </span>
                    </div>
                </div>

                {form.amenities.length > 0 && (
                    <div className="pt-2 border-t">
                        <span className="text-xs text-muted-foreground block mb-2">Équipements sélectionnés :</span>
                        <div className="flex flex-wrap gap-1.5">
                            {form.amenities.map((amenityId) => {
                                const amenity = AMENITIES_OPTIONS.find((a) => a.id === amenityId);
                                return (
                                    <Badge key={amenityId} variant="outline" className="text-xs bg-background">
                                        {amenity?.label}
                                    </Badge>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
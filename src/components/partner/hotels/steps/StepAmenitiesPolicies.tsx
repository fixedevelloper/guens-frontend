import { Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HotelFormData, AMENITIES_OPTIONS } from "@/types/hotel-form";

interface StepAmenitiesPoliciesProps {
    form: HotelFormData;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onToggleAmenity: (id: string) => void;
}

export function StepAmenitiesPolicies({ form, onChange, onToggleAmenity }: StepAmenitiesPoliciesProps) {
    return (
        <div className="space-y-5 animate-in fade-in-50 duration-200">
            <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <Sparkles className="size-5 text-primary" />
                    Équipements & Horaires
                </h3>
                <p className="text-xs text-muted-foreground">
                    Sélectionnez les commodités proposées à vos visiteurs.
                </p>
            </div>

            <div className="space-y-2">
                <Label>Commodités disponibles</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {AMENITIES_OPTIONS.map(({ id, label, icon: Icon }) => {
                        const selected = form.amenities.includes(id);
                        return (
                            <button
                                key={id}
                                type="button"
                                onClick={() => onToggleAmenity(id)}
                                className={`flex items-center gap-3 p-3 rounded-xl border text-left text-sm font-medium transition-all ${
                                    selected
                                        ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20"
                                        : "border-border hover:bg-muted/50 text-muted-foreground"
                                }`}
                            >
                                <div
                                    className={`p-2 rounded-lg ${
                                        selected
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-muted-foreground"
                                    }`}
                                >
                                    <Icon className="size-4" />
                                </div>
                                <span>{label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div className="space-y-2">
                    <Label htmlFor="checkInTime">Heure d'arrivée (Check-in)</Label>
                    <Input
                        id="checkInTime"
                        name="checkInTime"
                        type="time"
                        value={form.checkInTime}
                        onChange={onChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="checkOutTime">Heure de départ (Check-out)</Label>
                    <Input
                        id="checkOutTime"
                        name="checkOutTime"
                        type="time"
                        value={form.checkOutTime}
                        onChange={onChange}
                    />
                </div>
            </div>
        </div>
    );
}
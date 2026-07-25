import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HotelFormData } from "@/types/hotel-form";

interface StepLocationContactProps {
    form: HotelFormData;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function StepLocationContact({ form, onChange }: StepLocationContactProps) {
    return (
        <div className="space-y-5 animate-in fade-in-50 duration-200">
            <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <MapPin className="size-5 text-primary" />
                    Localisation & Contact
                </h3>
                <p className="text-xs text-muted-foreground">
                    Aidez vos clients à trouver votre établissement.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="city">Ville *</Label>
                    <Input
                        id="city"
                        name="city"
                        placeholder="ex: Douala"
                        required
                        value={form.city}
                        onChange={onChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="country">Pays *</Label>
                    <Input
                        id="country"
                        name="country"
                        required
                        value={form.country}
                        onChange={onChange}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Adresse physique complète *</Label>
                <Input
                    id="address"
                    name="address"
                    placeholder="ex: Boulevard de la Liberté, Akwa"
                    required
                    value={form.address}
                    onChange={onChange}
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone de la réception *</Label>
                    <Input
                        id="phone"
                        name="phone"
                        placeholder="+237 600 00 00 00"
                        required
                        value={form.phone}
                        onChange={onChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email professionnel *</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="contact@hotel.com"
                        required
                        value={form.email}
                        onChange={onChange}
                    />
                </div>
            </div>
        </div>
    );
}
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PartnerSettingsPage() {
    const { user } = useAuth();
    const [form, setForm] = useState({ companyName: "", phone: "", city: "" });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user?.partnerId) return;
        fetch(`/api/partners/${user.partnerId}`)
            .then((res) => res.json())
            .then((data) => setForm({ companyName: data.companyName, phone: data.phone, city: data.city }));
    }, [user]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        // Endpoint à créer côté backend : PATCH /api/partners/{partnerId}
        await fetch(`/api/partners/${user?.partnerId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        setSaving(false);
    }

    return (
        <div className="max-w-lg">
            <h2 className="mb-6 text-xl font-semibold">Paramètres du compte</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="companyName">Nom de l'entreprise</Label>
                    <Input
                        id="companyName"
                        value={form.companyName}
                        onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    />
                </div>
                <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                        id="phone"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                </div>
                <div>
                    <Label htmlFor="city">Ville</Label>
                    <Input
                        id="city"
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                    />
                </div>
                <Button type="submit" disabled={saving}>
                    {saving ? "Enregistrement…" : "Enregistrer"}
                </Button>
            </form>
        </div>
    );
}
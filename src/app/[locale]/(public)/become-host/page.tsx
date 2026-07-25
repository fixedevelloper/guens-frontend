"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
    Plane,
    Building2,
    Car,
    Home as HomeIcon,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Sparkles,
    ArrowRight,
    ShieldCheck,
    Building,
    UserCheck,
    FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { PartnerType, PartnerRegistrationRequest } from "@/types/partner";
import { createPartner } from "../../../../lib/api/partner";

const PARTNER_TYPE_CONFIG = [
    {
        value: "AIRLINE" as PartnerType,
        labelKey: "partnerTypes.airline.label",
        descKey: "partnerTypes.airline.description",
        icon: Plane,
    },
    {
        value: "HOTEL" as PartnerType,
        labelKey: "partnerTypes.hotel.label",
        descKey: "partnerTypes.hotel.description",
        icon: Building2,
    },
    {
        value: "CAR_RENTAL" as PartnerType,
        labelKey: "partnerTypes.carRental.label",
        descKey: "partnerTypes.carRental.description",
        icon: Car,
    },
    {
        value: "FURNISHED_RENTAL" as PartnerType,
        labelKey: "partnerTypes.furnishedRental.label",
        descKey: "partnerTypes.furnishedRental.description",
        icon: HomeIcon,
    },
];

export default function BecomeHostPage() {
    const t = useTranslations("BecomeHost");

    const [partnerType, setPartnerType] = useState<PartnerType | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [form, setForm] = useState<Omit<PartnerRegistrationRequest, "partnerType">>({
        companyName: "",
        registrationNumber: "",
        contactName: "",
        email: "",
        phone: "",
        city: "",
        country: "",
        fleetOrRoomsCount: "",
        description: "",
    });

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!partnerType) {
            setErrorMessage(t("errors.selectSector"));
            return;
        }

        setSubmitting(true);
        setErrorMessage(null);

        try {
            const payload: PartnerRegistrationRequest = {
                partnerType,
                ...form,
            };

            await createPartner(payload);
            setSuccess(true);
        } catch (err: any) {
            console.error(err);
            const status = err?.response?.status;

            if (status === 409) {
                setErrorMessage(t("errors.conflict"));
            } else {
                setErrorMessage(
                    err?.response?.data?.message || t("errors.default")
                );
            }
        } finally {
            setSubmitting(false);
        }
    }

    if (success) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
                <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-background shadow-2xl backdrop-blur-sm">
                    <CardContent className="pt-10 text-center space-y-6">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 shadow-inner">
                            <CheckCircle2 className="h-10 w-10" />
                        </div>

                        <div className="space-y-3">
                            <h1 className="text-3xl font-extrabold tracking-tight">
                                {t("success.title")}
                            </h1>
                            <p className="text-muted-foreground text-base max-w-md mx-auto">
                                {t("success.description")}
                            </p>
                        </div>

                        <div className="rounded-xl border bg-background/80 p-5 text-left text-sm space-y-4 max-w-md mx-auto shadow-sm">
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-foreground">
                                        {t("success.nextStepTitle")}
                                    </p>
                                    <p className="text-muted-foreground text-xs mt-1">
                                        {t("success.nextStepDesc")}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 flex justify-center">
                            <Button asChild size="lg">
                                <Link href="/">{t("success.backHome")}</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary border border-primary/20 shadow-sm">
                    <Sparkles className="h-3.5 w-3.5" />
                    {t("badge")}
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                    {t("title")}
                </h1>

                <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
                    {t("subtitle")}
                </p>
            </div>

            <div className="mt-14 space-y-4">
                <div className="flex items-center gap-2 font-semibold text-sm text-foreground/80">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                        1
                    </span>
                    {t("steps.selectSector")}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {PARTNER_TYPE_CONFIG.map(({ value, labelKey, descKey, icon: Icon }) => {
                        const isSelected = partnerType === value;

                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={() => {
                                    setPartnerType(value);
                                    setErrorMessage(null);
                                }}
                                className={`group relative flex flex-col items-start text-left p-5 rounded-2xl border transition-all duration-200 outline-none ${
                                    isSelected
                                        ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-lg"
                                        : "border-border bg-card hover:border-primary/50 hover:bg-accent/40 hover:shadow-md"
                                }`}
                            >
                                {isSelected && (
                                    <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-primary" />
                                )}

                                <div
                                    className={`p-3 rounded-xl mb-4 transition-colors ${
                                        isSelected
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-foreground group-hover:bg-primary/10"
                                    }`}
                                >
                                    <Icon className="h-6 w-6" />
                                </div>

                                <h3 className="font-semibold text-sm text-foreground">
                                    {t(labelKey)}
                                </h3>
                                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                                    {t(descKey)}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {partnerType && (
                <Card className="mt-10 border shadow-xl overflow-hidden">
                    <CardHeader className="border-b bg-muted/20">
                        <div className="flex items-center gap-2 font-semibold text-sm text-foreground/80 mb-1">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                                2
                            </span>
                            {t("steps.applicationForm")}
                        </div>
                        <CardTitle className="text-2xl">{t("form.title")}</CardTitle>
                        <CardDescription className="text-base">
                            {t("form.descriptionHeader")}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6">
                        {errorMessage && (
                            <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                                <p className="font-medium">{errorMessage}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Entité juridique */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 border-b pb-2">
                                    <Building className="h-4 w-4" />
                                    {t("form.sectionLegal")}
                                </h4>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="companyName">
                                            {t("form.companyName")} *
                                        </Label>
                                        <Input
                                            id="companyName"
                                            name="companyName"
                                            placeholder={t("form.companyNamePlaceholder")}
                                            required
                                            value={form.companyName}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="registrationNumber">
                                            {t("form.registrationNumber")} *
                                        </Label>
                                        <Input
                                            id="registrationNumber"
                                            name="registrationNumber"
                                            placeholder={t("form.registrationNumberPlaceholder")}
                                            required
                                            value={form.registrationNumber}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Responsable & Contact */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 border-b pb-2">
                                    <UserCheck className="h-4 w-4" />
                                    {t("form.sectionContact")}
                                </h4>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="contactName">
                                            {t("form.contactName")} *
                                        </Label>
                                        <Input
                                            id="contactName"
                                            name="contactName"
                                            placeholder={t("form.contactNamePlaceholder")}
                                            required
                                            value={form.contactName}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">
                                            {t("form.email")} *
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder={t("form.emailPlaceholder")}
                                            required
                                            value={form.email}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">
                                            {t("form.phone")} *
                                        </Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            placeholder={t("form.phonePlaceholder")}
                                            required
                                            value={form.phone}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="city">{t("form.city")} *</Label>
                                            <Input
                                                id="city"
                                                name="city"
                                                placeholder={t("form.cityPlaceholder")}
                                                required
                                                value={form.city}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="country">{t("form.country")} *</Label>
                                            <Input
                                                id="country"
                                                name="country"
                                                placeholder={t("form.countryPlaceholder")}
                                                required
                                                value={form.country}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Capacité & Présentation */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 border-b pb-2">
                                    <FileText className="h-4 w-4" />
                                    {t("form.sectionCapacity")}
                                </h4>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fleetOrRoomsCount">
                                            {t(`form.capacityLabel.${partnerType}`)}
                                        </Label>
                                        <Input
                                            id="fleetOrRoomsCount"
                                            name="fleetOrRoomsCount"
                                            placeholder={t("form.capacityPlaceholder")}
                                            value={form.fleetOrRoomsCount}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">
                                            {t("form.description")}
                                        </Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            rows={4}
                                            placeholder={t("form.descriptionPlaceholder")}
                                            value={form.description}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end">
                                <Button
                                    type="submit"
                                    size="lg"
                                    disabled={submitting}
                                    className="w-full sm:w-auto min-w-[220px] shadow-md"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {t("form.submitting")}
                                        </>
                                    ) : (
                                        <>
                                            {t("form.submit")}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
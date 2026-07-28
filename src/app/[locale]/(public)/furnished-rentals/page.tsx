import React from "react";
import {
    ShieldCheck,
    Headphones,
    Sparkles,
    CheckCircle2,
    MapPin,
    ArrowRight,
    Home,
    Building2,
    BedDouble,
    KeyRound,
    Wifi,
    Tv,
    Utensils,
    Waves,
    Lock,
    Clock,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FurnishedRentalForm } from "@/components/search/furnished-rental-form";

// Types de biens proposés
const PROPERTY_TYPES = [
    {
        id: "studio",
        icon: Home,
        titleKey: "typeStudioTitle",
        descKey: "typeStudioDesc",
        tagKey: "tagCozy",
        capacity: "1-2",
    },
    {
        id: "apartment",
        icon: Building2,
        titleKey: "typeApartmentTitle",
        descKey: "typeApartmentDesc",
        tagKey: "tagPopular",
        capacity: "2-4",
    },
    {
        id: "villa",
        icon: Waves,
        titleKey: "typeVillaTitle",
        descKey: "typeVillaDesc",
        tagKey: "tagLuxury",
        capacity: "6+",
    },
    {
        id: "penthouse",
        icon: Sparkles,
        titleKey: "typePenthouseTitle",
        descKey: "typePenthouseDesc",
        tagKey: "tagVip",
        capacity: "4-6",
    },
];

// Équipements & Garanties
const HIGHLIGHTS = [
    { icon: Wifi, titleKey: "amenitiesWifi", descKey: "amenitiesWifiDesc" },
    { icon: Utensils, titleKey: "amenitiesKitchen", descKey: "amenitiesKitchenDesc" },
    { icon: Lock, titleKey: "amenitiesSecurity", descKey: "amenitiesSecurityDesc" },
    { icon: Clock, titleKey: "amenitiesFlexible", descKey: "amenitiesFlexibleDesc" },
];

// Étapes de réservation
const STEPS = [
    {
        number: "01",
        titleKey: "step1Title",
        descKey: "step1Desc",
        icon: MapPin,
    },
    {
        number: "02",
        titleKey: "step2Title",
        descKey: "step2Desc",
        icon: KeyRound,
    },
    {
        number: "03",
        titleKey: "step3Title",
        descKey: "step3Desc",
        icon: Home,
    },
];

export default function FurnishedRentalsPage() {
    const t = useTranslations("FurnishedRentalPage");

    return (
        <main className="min-h-screen bg-background pb-16">
            {/* 1. HERO SECTION */}
            <section className="relative pt-8 pb-16 md:pt-16 md:pb-24 overflow-hidden border-b border-border/40 bg-gradient-to-b from-primary/5 via-background to-background">
                {/* Effet lumineux de fond */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-primary/10 blur-[120px] pointer-events-none -z-10 rounded-full" />

                <div className="container max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-semibold">
                            <Sparkles className="size-4" />
                            <span>{t("badge")}</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-tight">
                            {t("heroTitle")}
                        </h1>
                        <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto">
                            {t("heroSubtitle")}
                        </p>
                    </div>

                    {/* Formulaire de recherche */}
                    <div className="max-w-5xl mx-auto">
                        <FurnishedRentalForm />
                    </div>

                    {/* Engagements clés */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mt-10 pt-6 border-t border-border/50 text-xs sm:text-sm">
                        <div className="flex items-center gap-2.5 text-muted-foreground">
                            <ShieldCheck className="size-5 text-primary shrink-0" />
                            <span className="font-medium">{t("perkVerifiedHomes")}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-muted-foreground">
                            <CheckCircle2 className="size-5 text-primary shrink-0" />
                            <span className="font-medium">{t("perkInstantBooking")}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-muted-foreground">
                            <Headphones className="size-5 text-primary shrink-0" />
                            <span className="font-medium">{t("perkSupport247")}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-muted-foreground">
                            <Utensils className="size-5 text-primary shrink-0" />
                            <span className="font-medium">{t("perkFullyEquipped")}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. TYPES DE BIENS / OFFRES */}
            <section className="py-16 container max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                            {t("typesTitle")}
                        </h2>
                        <p className="text-muted-foreground text-sm mt-1">
                            {t("typesSubtitle")}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {PROPERTY_TYPES.map((prop) => {
                        const IconComponent = prop.icon;
                        return (
                            <div
                                key={prop.id}
                                className="group relative rounded-3xl border border-border/60 bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                            <IconComponent className="size-6" />
                                        </div>
                                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground">
                                            {t(prop.tagKey)}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                                        {t(prop.titleKey)}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                        {t(prop.descKey)}
                                    </p>
                                </div>

                                <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground font-medium">
                                    <span className="flex items-center gap-1.5">
                                        <BedDouble className="size-4 text-primary" />
                                        {prop.capacity} {t("guestsCapacity")}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* 3. ÉQUIPEMENTS & CONFORT */}
            <section className="py-16 bg-muted/20 border-y border-border/40">
                <div className="container max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                            {t("amenitiesTitle")}
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            {t("amenitiesSubtitle")}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {HIGHLIGHTS.map((item, index) => {
                            const IconComp = item.icon;
                            return (
                                <div
                                    key={index}
                                    className="p-6 rounded-3xl bg-background border border-border/60 shadow-sm flex flex-col gap-3"
                                >
                                    <div className="p-3 rounded-2xl bg-primary/10 text-primary w-fit">
                                        <IconComp className="size-6" />
                                    </div>
                                    <h3 className="text-base font-bold text-foreground">
                                        {t(item.titleKey)}
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {t(item.descKey)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 4. COMMENT ÇA MARCHE */}
            <section className="py-16 container max-w-7xl mx-auto px-4 sm:px-6">
                <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                        {t("howItWorksTitle")}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        {t("howItWorksSubtitle")}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {STEPS.map((step) => {
                        const IconComp = step.icon;
                        return (
                            <div
                                key={step.number}
                                className="relative flex flex-col items-center text-center p-6 rounded-3xl bg-card border border-border/60 shadow-sm"
                            >
                                <div className="absolute -top-4 px-3 py-1 rounded-full bg-primary text-primary-foreground font-black text-xs shadow-md">
                                    {step.number}
                                </div>
                                <div className="p-4 rounded-2xl bg-primary/10 text-primary mb-4 mt-2">
                                    <IconComp className="size-7" />
                                </div>
                                <h3 className="text-base font-bold text-foreground mb-2">
                                    {t(step.titleKey)}
                                </h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {t(step.descKey)}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* 5. BANNIÈRE APPEL À L'ACTION (DEVENIR HÔTE) */}
            <section className="py-12 container max-w-7xl mx-auto px-4 sm:px-6">
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-[#489324] p-8 sm:p-12 text-primary-foreground shadow-2xl">
                    <div className="relative z-10 max-w-2xl space-y-4">
                        <span className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold">
                            {t("ctaBadge")}
                        </span>
                        <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight">
                            {t("ctaTitle")}
                        </h2>
                        <p className="text-sm sm:text-base opacity-90 leading-relaxed">
                            {t("ctaSubtitle")}
                        </p>
                        <div className="pt-2">
                            <Link
                                href="/become-host"
                                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-background text-foreground hover:bg-background/90 font-bold text-sm shadow-lg transition-all active:scale-95"
                            >
                                <span>{t("ctaBtn")}</span>
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
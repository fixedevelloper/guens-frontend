"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
    ListChecks,
    CalendarClock,
    Wallet,
    PlusCircle,
    Building2,
    ArrowUpRight,
    Sparkles,
    Clock,
    CheckCircle2,
    TrendingUp,
    ChevronRight,
    ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PartnerDashboardPage() {
    const t = useTranslations("Partner.dashboard");

    // Données des cartes de statistiques (extensibles ou connectables aux props/API)
    const statCards = [
        {
            key: "activeListings",
            icon: ListChecks,
            value: "12",
            subtitle: t("cards.activeListingsSubtitle"),
            color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400",
            borderColor: "border-emerald-200 dark:border-emerald-800/40",
        },
        {
            key: "pendingBookings",
            icon: CalendarClock,
            value: "5",
            subtitle: t("cards.pendingBookingsSubtitle"),
            color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400",
            borderColor: "border-amber-200 dark:border-amber-800/40",
        },
        {
            key: "monthlyRevenue",
            icon: Wallet,
            value: "2,450,000 FCFA",
            subtitle: t("cards.monthlyRevenueSubtitle"),
            color: "text-primary bg-primary/10",
            borderColor: "border-primary/20",
        },
    ];

    // Exemples d'activités récentes / réservations en attente
    const dummyRecentBookings = [
        {
            id: "BK-8091",
            title: "Appartement d'exception - Bonapriso",
            client: "Jean-Paul M.",
            date: "25 - 28 Jul 2026",
            amount: "185,000 FCFA",
            status: "PENDING",
        },
        {
            id: "BK-8088",
            title: "Toyota Prado 2023 (Avec Chauffeur)",
            client: "Aïcha K.",
            date: "26 Jul 2026",
            amount: "75,000 FCFA",
            status: "CONFIRMED",
        },
    ];

    return (
        <div className="space-y-8 pb-10">
            {/* Bannière de Bienvenue */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 text-white shadow-xl">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30 shadow-sm">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>{t("badge")}</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                            {t("title")}
                        </h1>
                        <p className="text-slate-300 text-sm sm:text-base max-w-xl">
                            {t("subtitle")}
                        </p>
                    </div>

                    <Button
                        asChild
                        size="lg"
                        className="bg-[#7bcd4f] hover:bg-[#6ab840] text-slate-950 font-extrabold shadow-lg shadow-emerald-900/30 shrink-0"
                    >
                        <Link href="/partner/listings/new">
                            <PlusCircle className="mr-2 h-5 w-5" />
                            {t("addListing")}
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Grille des statistiques (KPIs) */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {statCards.map(({ key, icon: Icon, value, subtitle, color, borderColor }) => (
                    <Card
                        key={key}
                        className={`border shadow-sm hover:shadow-md transition-all duration-200 ${borderColor}`}
                    >
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    {t(`cards.${key}`)}
                                </span>
                                <div className={`p-3 rounded-2xl ${color}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                            </div>

                            <div>
                                <p className="text-3xl font-extrabold text-foreground tracking-tight">
                                    {value}
                                </p>
                                <p className="text-xs text-muted-foreground font-medium mt-1 flex items-center gap-1">
                                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                                    {subtitle}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Raccourcis d'actions et Réservations récentes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Dernières réservations */}
                <Card className="lg:col-span-2 border shadow-md">
                    <CardHeader className="border-b bg-card/50 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-primary" />
                                    {t("recentActivity.title")}
                                </CardTitle>
                                <CardDescription className="text-xs mt-0.5">
                                    {t("recentActivity.desc")}
                                </CardDescription>
                            </div>

                            <Button asChild variant="ghost" size="sm" className="text-xs text-primary font-semibold">
                                <Link href="/partner/bookings">
                                    {t("recentActivity.viewAll")}
                                    <ChevronRight className="ml-1 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <div className="divide-y">
                            {dummyRecentBookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-foreground">
                                                {booking.title}
                                            </span>
                                            <Badge
                                                variant={booking.status === "PENDING" ? "outline" : "default"}
                                                className={`text-[10px] uppercase font-bold ${
                                                    booking.status === "PENDING"
                                                        ? "border-amber-500/40 text-amber-600 bg-amber-50 dark:bg-amber-950/40"
                                                        : "bg-emerald-600 text-white"
                                                }`}
                                            >
                                                {booking.status === "PENDING" ? "En attente" : "Confirmé"}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {booking.client} • {booking.date}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-0 pt-2 sm:pt-0">
                                        <span className="font-extrabold text-sm text-foreground">
                                            {booking.amount}
                                        </span>
                                        <Button asChild variant="outline" size="sm" className="h-8 rounded-xl text-xs font-semibold">
                                            <Link href={`/partner/bookings/${booking.id}`}>
                                                Gérer
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Accès Rapides */}
                <Card className="border shadow-md">
                    <CardHeader className="border-b bg-card/50 pb-4">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-emerald-500" />
                            {t("quickActions.title")}
                        </CardTitle>
                        <CardDescription className="text-xs">
                            {t("quickActions.desc")}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-5 space-y-3">
                        <Button
                            asChild
                            variant="outline"
                            className="w-full justify-between h-12 rounded-xl border-border/80 hover:border-primary/50 hover:bg-primary/5 font-semibold text-sm"
                        >
                            <Link href="/partner/listings">
                                <div className="flex items-center gap-2.5">
                                    <Building2 className="h-4 w-4 text-primary" />
                                    <span>{t("quickActions.manageListings")}</span>
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                            </Link>
                        </Button>

                        <Button
                            asChild
                            variant="outline"
                            className="w-full justify-between h-12 rounded-xl border-border/80 hover:border-primary/50 hover:bg-primary/5 font-semibold text-sm"
                        >
                            <Link href="/partner/bookings">
                                <div className="flex items-center gap-2.5">
                                    <CalendarClock className="h-4 w-4 text-amber-500" />
                                    <span>{t("quickActions.viewBookings")}</span>
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                            </Link>
                        </Button>

                        <Button
                            asChild
                            variant="outline"
                            className="w-full justify-between h-12 rounded-xl border-border/80 hover:border-primary/50 hover:bg-primary/5 font-semibold text-sm"
                        >
                            <Link href="/partner/payouts">
                                <div className="flex items-center gap-2.5">
                                    <Wallet className="h-4 w-4 text-emerald-500" />
                                    <span>{t("quickActions.payouts")}</span>
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
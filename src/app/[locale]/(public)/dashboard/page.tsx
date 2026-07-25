"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/auth-context";
import { useMyBookingsQuery } from "@/hooks/use-booking";

import {
    Plane,
    Calendar,
    Sparkles,
    Plus,
    RefreshCw,
    AlertCircle,
    Ticket,
    CheckCircle2,
    Clock,
    Search,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { BookingRow } from "@/components/dashboard/booking-row";

type FilterTab = "ALL" | "UPCOMING" | "COMPLETED";

export default function DashboardPage() {
    const t = useTranslations("Dashboard");
    const { user } = useAuth();
    const bookingsQuery = useMyBookingsQuery();
    const [activeTab, setActiveTab] = useState<FilterTab>("ALL");

    const bookings = bookingsQuery.data ?? [];

    // Calcul des statistiques
    const stats = useMemo(() => {
        const total = bookings.length;
        const upcoming = bookings.filter((b: any) =>
            b.status === "CONFIRMED" || b.status === "PENDING" || b.status === "BOOKED"
        ).length;
        const completed = bookings.filter((b: any) =>
            b.status === "COMPLETED" || b.status === "CANCELLED"
        ).length;

        return { total, upcoming, completed };
    }, [bookings]);

    // Filtrage des réservations
    const filteredBookings = useMemo(() => {
        if (activeTab === "UPCOMING") {
            return bookings.filter((b: any) =>
                b.status === "CONFIRMED" || b.status === "PENDING" || b.status === "BOOKED"
            );
        }
        if (activeTab === "COMPLETED") {
            return bookings.filter((b: any) =>
                b.status === "COMPLETED" || b.status === "CANCELLED"
            );
        }
        return bookings;
    }, [bookings, activeTab]);

    return (
        <div className="space-y-8 pb-10">
            {/* Header avec Bannière de bienvenue */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 text-white shadow-xl">
                <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>{t("welcomeBadge")}</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            {t("greeting", { name: user?.fullName || user?.email?.split("@")[0] || "" })}
                        </h1>
                        <p className="text-slate-300 text-sm sm:text-base max-w-xl">
                            {t("subtitle")}
                        </p>
                    </div>

                    <Button asChild size="lg" className="bg-[#7bcd4f] hover:bg-[#6ab840] text-slate-950 font-bold shadow-lg shadow-emerald-900/20 shrink-0">
                        <Link href="/">
                            <Plus className="mr-2 h-5 w-5" />
                            {t("newBookingBtn")}
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Cartes d'indicateurs (Statistiques) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <Card className="border shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {t("stats.total")}
                            </p>
                            <h3 className="text-2xl font-black mt-1 text-foreground">
                                {bookingsQuery.isLoading ? <Skeleton className="h-8 w-12" /> : stats.total}
                            </h3>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                            <Ticket className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {t("stats.upcoming")}
                            </p>
                            <h3 className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400">
                                {bookingsQuery.isLoading ? <Skeleton className="h-8 w-12" /> : stats.upcoming}
                            </h3>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <Clock className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {t("stats.completed")}
                            </p>
                            <h3 className="text-2xl font-black mt-1 text-foreground">
                                {bookingsQuery.isLoading ? <Skeleton className="h-8 w-12" /> : stats.completed}
                            </h3>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Section Principale : Liste des Réservations */}
            <Card className="border shadow-lg overflow-hidden">
                <CardHeader className="border-b bg-card/50 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                {t("myBookingsTitle")}
                            </CardTitle>
                            <CardDescription className="text-xs mt-1">
                                {t("myBookingsDesc")}
                            </CardDescription>
                        </div>

                        {/* Onglets de filtrage + Bouton Rafraîchir */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center p-1 bg-muted rounded-xl text-xs font-medium">
                                <button
                                    onClick={() => setActiveTab("ALL")}
                                    className={`px-3 py-1.5 rounded-lg transition-all ${
                                        activeTab === "ALL"
                                            ? "bg-background text-foreground shadow-sm font-bold"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {t("tabs.all")}
                                </button>
                                <button
                                    onClick={() => setActiveTab("UPCOMING")}
                                    className={`px-3 py-1.5 rounded-lg transition-all ${
                                        activeTab === "UPCOMING"
                                            ? "bg-background text-foreground shadow-sm font-bold"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {t("tabs.upcoming")}
                                </button>
                                <button
                                    onClick={() => setActiveTab("COMPLETED")}
                                    className={`px-3 py-1.5 rounded-lg transition-all ${
                                        activeTab === "COMPLETED"
                                            ? "bg-background text-foreground shadow-sm font-bold"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {t("tabs.completed")}
                                </button>
                            </div>

                            <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 rounded-xl"
                                onClick={() => bookingsQuery.refetch()}
                                title={t("refresh")}
                                disabled={bookingsQuery.isFetching}
                            >
                                <RefreshCw className={`h-4 w-4 ${bookingsQuery.isFetching ? "animate-spin" : ""}`} />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-6">
                    {/* ÉTAT 1 : CHARGEMENT */}
                    {bookingsQuery.isLoading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-20 w-full rounded-2xl" />
                                <Skeleton className="h-20 w-full rounded-2xl" />
                                <Skeleton className="h-20 w-full rounded-2xl" />
                            </div>
                        ) :

                        /* ÉTAT 2 : ERREUR */
                        bookingsQuery.isError ? (
                                <Alert variant="destructive" className="rounded-2xl border-destructive/30 bg-destructive/10">
                                    <AlertCircle className="h-5 w-5" />
                                    <AlertTitle>{t("errorTitle")}</AlertTitle>
                                    <AlertDescription className="mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <span>{t("loadError")}</span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => bookingsQuery.refetch()}
                                            className="border-destructive/40 hover:bg-destructive/20 text-destructive shrink-0"
                                        >
                                            {t("retry")}
                                        </Button>
                                    </AlertDescription>
                                </Alert>
                            ) :

                            /* ÉTAT 3 : AUCUNE RÉSERVATION (EMPTY STATE) */
                            filteredBookings.length === 0 ? (
                                    <div className="py-12 px-4 text-center max-w-md mx-auto space-y-4">
                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                                            <Plane className="h-8 w-8 text-slate-400" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-lg text-foreground">
                                                {activeTab === "ALL" ? t("noBookingsTitle") : t("noFilteredBookingsTitle")}
                                            </h3>
                                            <p className="text-xs text-muted-foreground">
                                                {activeTab === "ALL" ? t("noBookingsDesc") : t("noFilteredBookingsDesc")}
                                            </p>
                                        </div>
                                        {activeTab === "ALL" && (
                                            <div className="pt-2">
                                                <Button asChild size="sm" className="rounded-xl">
                                                    <Link href="/">
                                                        <Search className="mr-2 h-4 w-4" />
                                                        {t("searchDealsBtn")}
                                                    </Link>
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ) :

                                /* ÉTAT 4 : LISTE DES RÉSERVATIONS */
                                (
                                    <div className="space-y-3">
                                        {filteredBookings.map((booking: any) => (
                                            <BookingRow key={booking.id} booking={booking} />
                                        ))}
                                    </div>
                                )}
                </CardContent>
            </Card>
        </div>
    );
}
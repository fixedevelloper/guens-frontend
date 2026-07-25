"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { CalendarCheck, LayoutDashboard, ListChecks, Settings } from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/dashboard-shell";
import {usePartnerQuery} from "../../../../hooks/use-partner-queries";

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
    const t = useTranslations("Partner");
    const router = useRouter();
    const { isAuthenticated, isPartner, isHydrated, user } = useAuth();

    // Redirection si l'utilisateur n'est pas authentifié ou n'est pas un partenaire
    useEffect(() => {
        if (isHydrated && !(isAuthenticated && isPartner)) {
            router.replace("/login");
        }
    }, [isHydrated, isAuthenticated, isPartner, router]);

    // Récupération des données du partenaire via React Query
    const partnerId = user?.partnerId ?? null;
    const { data: partner, isLoading: isPartnerLoading } = usePartnerQuery(partnerId);

    // Affichage du Skeleton pendant l'hydratation, la vérification auth ou le chargement des données
    if (!isHydrated || !isAuthenticated || !isPartner || isPartnerLoading || !partner) {
        return <PartnerLayoutSkeleton />;
    }

    const navItems: DashboardNavItem[] = [
        { href: "/partner", label: t("navDashboard") ?? "Tableau de bord", icon: LayoutDashboard },
        { href: "/partner/listings", label: t("navListings") ?? "Annonces", icon: ListChecks },
        { href: "/partner/bookings", label: t("navBookings") ?? "Réservations", icon: CalendarCheck },
        { href: "/partner/settings", label: t("navSettings") ?? "Paramètres", icon: Settings },
    ];

    return (
        <DashboardShell eyebrow={partner.companyName} navItems={navItems}>
            {children}
        </DashboardShell>
    );
}

// SQUELETTE DE STRUCTURE DE L'ESPACE PARTENAIRE
function PartnerLayoutSkeleton() {
    return (
        <div className="mx-auto max-w-6xl px-4 py-8 animate-pulse space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-8 w-48 rounded-xl" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8">
                <div className="space-y-2.5 hidden md:block">
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Skeleton className="h-28 w-full rounded-2xl" />
                        <Skeleton className="h-28 w-full rounded-2xl" />
                        <Skeleton className="h-28 w-full rounded-2xl" />
                    </div>
                    <Skeleton className="h-80 w-full rounded-2xl" />
                </div>
            </div>
        </div>
    );
}
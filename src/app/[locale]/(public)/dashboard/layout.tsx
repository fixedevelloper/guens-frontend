"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Building2,
  Plane,
  Ticket,
  LayoutDashboard,
  BadgePercent,
  Wallet,
  Users,
  ShoppingBag,
} from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DashboardShell,
  type DashboardNavItem,
} from "@/components/dashboard/dashboard-shell";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuth();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  // Vérification du statut revendeur
  const isReseller =
    user?.role === "RESELLER" ||
    user?.role?.includes("RESELLER") ||
    user?.resellerStatus === "APPROVED" ||
    user?.resellerStatus === "ACTIVE";

  // 1. Menus de base (Espace Client)
  const baseNavItems: DashboardNavItem[] = [
    { href: "/dashboard", label: t("navMyBookings") ?? "Mes Réservations", icon: Ticket },
    { href: "/flights", label: t("searchFlights") ?? "Rechercher un vol", icon: Plane },
    { href: "/hotels", label: t("searchHotels") ?? "Rechercher un hôtel", icon: Building2 },
  ];

  // 2. Menus réservés aux REVENDEURS (Routage sous /dashboard/reseller/*)
  const resellerNavItems: DashboardNavItem[] = isReseller
    ? [
        {
          href: "/dashboard/reseller/overlays",
          label: t("resellerDashboard") ?? "Tableau de bord",
          icon: LayoutDashboard,
        },
        {
          href: "/dashboard/reseller/bookings",
          label: t("resellerBookings") ?? "Mes Ventes",
          icon: ShoppingBag,
        },
        {
          href: "/dashboard/reseller/commissions",
          label: t("commissions") ?? "Mes Commissions",
          icon: BadgePercent,
        },
        {
          href: "/dashboard/reseller/wallet",
          label: t("wallet") ?? "Portefeuille & Solde",
          icon: Wallet,
        },
        {
          href: "/dashboard/reseller/customers", // Corrigé ici
          label: t("customers") ?? "Mes Clients",
          icon: Users,
        },
      ]
    : [];

  return (
    <DashboardShell
      eyebrow={t("clientEyebrow") ?? "Espace Client"}
      navItems={baseNavItems}
      resellerNavItems={resellerNavItems.length > 0 ? resellerNavItems : undefined}
    >
      {children}
    </DashboardShell>
  );
}
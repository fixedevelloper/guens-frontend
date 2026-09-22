"use client";

import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Banknote, LayoutDashboard, Receipt, Users, Building2, Database, Store, PieChart, CreditCard, MapPin, Landmark, UserCog } from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardShell, DashboardNavItem } from "@/components/dashboard/dashboard-shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const { isAuthenticated, isAdmin, isHydrated } = useAuth();

  useEffect(() => {
    if (isHydrated && !(isAuthenticated && isAdmin)) {
      // TEMPORARY diagnostic (prod login bug: /workspace bounces to /login despite the header
      // showing isAdmin=true) - remove once root-caused. Shows the exact state this effect saw.
      console.warn("[AdminLayout] redirecting to /login", { isHydrated, isAuthenticated, isAdmin });
      router.replace("/login");
    }
  }, [isHydrated, isAuthenticated, isAdmin, router]);

  if (!isHydrated || !isAuthenticated || !isAdmin) {
    return <AdminLayoutSkeleton />;
  }

  const navItems: DashboardNavItem[] = [
    { href: "/workspace", label: t("navOverview") ?? "Vue d'ensemble", icon: LayoutDashboard },
    { href: "/workspace/bookings", label: t("navBookings") ?? "Réservations", icon: Receipt },
    { href: "/workspace/users", label: t("navUsers") ?? "Utilisateurs", icon: Users },
    { href: "/workspace/agents", label: t("navAgents") ?? "Agents", icon: UserCog },
    { href: "/workspace/partners", label: t("navPartners") ?? "Partenaires", icon: Building2 },
    { href: "/workspace/resellers", label: t("navResellers") ?? "Revendeurs", icon: Store },
    { href: "/workspace/commission", label: t("navCommission") ?? "Commissions", icon: Banknote },
    { href: "/workspace/shareholders", label: t("navShareholders") ?? "Actionnaires", icon: PieChart },
    { href: "/workspace/payment-providers", label: t("navPaymentProviders") ?? "Fournisseurs de paiement", icon: CreditCard },
    { href: "/workspace/merchant-codes", label: t("navMerchantCodes") ?? "Codes marchands", icon: Landmark },
    { href: "/workspace/geo/sync", label: t("navGeo") ?? "Données Géo", icon: Database },
    { href: "/workspace/destinations", label: t("navDestinations") ?? "Destinations", icon: MapPin },
  ];

  return (
    <DashboardShell eyebrow={t("adminEyebrow") ?? "Administration"} navItems={navItems}>
      {children}
    </DashboardShell>
  );
}

// SQUELETTE DE STRUCTURE ALIGNÉ SUR LE DASHBOARD SHELL
function AdminLayoutSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:py-8 animate-pulse">
      <div className="flex items-start gap-6">
        {/* Sidebar Skeleton */}
        <div className="hidden w-60 shrink-0 rounded-2xl border border-border/40 p-4 space-y-4 sm:flex sm:flex-col">
          <Skeleton className="h-5 w-28 rounded-md mb-2" />
          <Skeleton className="h-9 w-full rounded-xl" />
          <Skeleton className="h-9 w-full rounded-xl" />
          <Skeleton className="h-9 w-full rounded-xl" />
          <Skeleton className="h-9 w-full rounded-xl" />
          <Skeleton className="h-9 w-full rounded-xl" />
          <Skeleton className="h-9 w-full rounded-xl" />
          <Skeleton className="h-9 w-full rounded-xl" />
        </div>

        {/* Main Content Area Skeleton */}
        <div className="min-w-0 flex-1 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
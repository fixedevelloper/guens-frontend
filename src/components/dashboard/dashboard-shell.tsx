// components/dashboard/dashboard-shell.tsx
"use client";

import { useState, useEffect, type ComponentType, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { LogOut, Menu, X, Sparkles, Store, ArrowRight } from "lucide-react";

import { Link, usePathname } from "@/i18n/navigation";
import { useAuth } from "@/context/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  isResellerOnly?: boolean;
}

export interface DashboardStatusBadge {
  label: string;
  tone: "pending" | "success" | "destructive";
}

interface DashboardShellProps {
  eyebrow: string;
  navItems: DashboardNavItem[];
  resellerNavItems?: DashboardNavItem[];
  statusBadge?: DashboardStatusBadge;
  children: ReactNode;
}

const STATUS_BADGE_STYLES: Record<DashboardStatusBadge["tone"], string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  success: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
};

function initials(fullName: string | undefined) {
  if (!fullName) return "?";
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function DashboardShell({
  eyebrow,
  navItems,
  resellerNavItems = [],
  statusBadge,
  children,
}: DashboardShellProps) {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Détection des rôles
  const isReseller = Boolean(
    user?.role === "RESELLER"
  );
  
  // Seuls les utilisateurs avec le rôle CLIENT (CUSTOMER) peuvent devenir revendeur
  const isCustomer = user?.role === "CUSTOMER";

  // Empêche le défilement de la page en arrière-plan sur mobile
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const renderNavLink = (item: DashboardNavItem) => {
    const active =
      item.href === "/" || item.href === "/dashboard"
        ? pathname === item.href
        : pathname.startsWith(item.href);

    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold transition-all relative group",
          active
            ? "bg-primary/[0.06] text-primary shadow-2xs border-l-2 border-primary rounded-l-none pl-3"
            : "text-muted-foreground/90 hover:bg-slate-50/80 dark:hover:bg-zinc-900/50 hover:text-foreground"
        )}
      >
        <Icon
          className={cn(
            "size-4 shrink-0 transition-transform duration-200 group-hover:scale-105",
            active ? "text-primary stroke-[2.2]" : "text-muted-foreground/75"
          )}
        />
        <span>{item.label}</span>
      </Link>
    );
  };

  const nav = (
    <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
      {/* SECTION NAVIGATION standard */}
      <div className="space-y-1">
        {navItems.map(renderNavLink)}
      </div>

      {/* SECTION NAVIGATIONS REVENDEUR (Si Revendeur actif) */}
      {isReseller && resellerNavItems.length > 0 && (
        <div className="space-y-1 pt-2">
          <div className="px-3 pb-1.5 flex items-center gap-1.5">
            <Store className="size-3.5 text-emerald-600" />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Espace Revendeur
            </span>
          </div>
          {resellerNavItems.map(renderNavLink)}
        </div>
      )}

      {/* ENCART "DEVENIR REVENDEUR" (Affiché UNIQUEMENT pour les rôles CUSTOMER) */}
      {isCustomer && (
        <div className="pt-2">
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-3.5 space-y-2.5 shadow-2xs">
            <div className="flex items-center gap-2 text-primary font-black text-xs">
              <Store className="size-4 shrink-0" />
              <span>Devenir revendeur</span>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
              Gagnez des commissions sur vos ventes de billets et d'hôtels.
            </p>
            <Button
              asChild
              size="sm"
              className="w-full h-8 text-xs font-bold rounded-xl gap-1.5 shadow-xs"
              onClick={() => setMobileOpen(false)}
            >
              <Link href="/become-reseller">
                <span>Postuler</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const footer = (
    <div className="p-4 space-y-3 shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-black text-primary border border-primary/15 shadow-2xs">
          {initials(user?.fullName)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-xs font-extrabold text-foreground leading-snug">
              {user?.fullName}
            </p>
          </div>
          <p className="truncate text-[10px] text-muted-foreground/80 font-semibold">
            {user?.email}
          </p>
        </div>

        {/* BADGES RÔLE */}
        {isAdmin ? (
          <Badge
            variant="default"
            className="rounded-lg bg-primary/10 text-primary border-none hover:bg-primary/10 px-1.5 py-0.5 text-[9px] font-black tracking-wide shrink-0"
          >
            ADMIN
          </Badge>
        ) : isReseller ? (
          <Badge
            variant="outline"
            className="rounded-lg bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-1.5 py-0.5 text-[9px] font-black tracking-wide shrink-0"
          >
            AGENT
          </Badge>
        ) : null}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start rounded-xl text-xs font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/5 gap-2 h-9 border border-border/20 hover:border-destructive/20 transition-all"
        onClick={logout}
      >
        <LogOut className="size-3.5 stroke-[2]" />
        {t("logout") ?? "Se déconnecter"}
      </Button>
    </div>
  );

  const header = (
    <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between gap-2 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <Sparkles className="size-3.5 text-primary shrink-0" />
        <p className="truncate text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          {eyebrow}
        </p>
      </div>
      {statusBadge && (
        <Badge
          variant="outline"
          className={cn(
            "shrink-0 rounded-lg px-1.5 py-0.5 text-[9px] font-black tracking-wide",
            STATUS_BADGE_STYLES[statusBadge.tone]
          )}
        >
          {statusBadge.label}
        </Badge>
      )}
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:py-8">
      {/* HEADER MOBILE */}
      <div className="mb-5 sm:hidden flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileOpen(true)}
          className="rounded-xl font-bold text-xs gap-2 border-border/70 h-9.5 px-3.5"
        >
          <Menu className="size-4 text-primary" />
          <span className="capitalize">{eyebrow.toLowerCase()}</span>
        </Button>

        <div className="flex items-center gap-2">
          {/* Affiche le bouton Revendeur uniquement pour les rôles CUSTOMER */}
          {isCustomer && (
            <Button
              asChild
              size="sm"
              variant="default"
              className="rounded-xl h-8 text-xs font-bold gap-1.5 shadow-2xs"
            >
              <Link href="/become-reseller">
                <Store className="size-3.5" />
                <span>Revendeur</span>
              </Link>
            </Button>
          )}

          {statusBadge && (
            <Badge
              variant="outline"
              className={cn(
                "rounded-lg px-1.5 py-0.5 text-[9px] font-black tracking-wide",
                STATUS_BADGE_STYLES[statusBadge.tone]
              )}
            >
              {statusBadge.label}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-start gap-6">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden w-64 shrink-0 self-start rounded-2xl border border-border/50 bg-card sm:flex sm:flex-col shadow-2xs max-h-[calc(100vh-5rem)] sticky top-20">
          {header}
          {nav}
          <Separator className="bg-border/30" />
          {footer}
        </aside>

        {/* MOBILE SIDEBAR & OVERLAY */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 sm:hidden">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-card border-r border-border/30 shadow-2xl animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {eyebrow}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl size-8"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Fermer le menu"
                >
                  <X className="size-4" />
                </Button>
              </div>
              {nav}
              <Separator className="bg-border/30" />
              {footer}
            </div>
          </div>
        )}

        {/* CONTENU PRINCIPAL */}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
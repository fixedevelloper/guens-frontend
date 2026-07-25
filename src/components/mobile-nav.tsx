"use client";

import React, { useState } from "react";
import {
    Plane,
    Building2,
    User,
    LogIn,
    Handshake,
    Home,
    LayoutDashboard,
    LogOut,
    ShieldCheck,
    UserCheck,
    ChevronRight,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/context/auth-context";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

export function MobileNav() {
    const t = useTranslations("Nav");
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const [open, setOpen] = useState(false);

    const isFlightsActive = pathname.startsWith("/flights");
    const isHotelsActive = pathname.startsWith("/hotels");
    const isHomeActive = pathname === "/";
    const isDashboardActive =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/admin") ||
        pathname.startsWith("/account");
    const isBecomeHostActive = pathname.startsWith("/become-host");

    const handleLogout = async () => {
        setOpen(false);
        if (logout) {
            await logout();
        }
        router.push("/login");
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex w-full items-center justify-around border-t border-border/40 bg-background/95 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur-lg sm:hidden shadow-lg">
            {/* Accueil */}
            <Link
                href="/"
                className={`flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                    isHomeActive
                        ? "text-primary font-bold"
                        : "text-muted-foreground hover:text-foreground"
                }`}
            >
                <div
                    className={`flex items-center justify-center rounded-full px-3 py-1 transition-all ${
                        isHomeActive ? "bg-primary/10" : ""
                    }`}
                >
                    <Home className="size-5" />
                </div>
                <span>{t("home")}</span>
            </Link>

            {/* Vols */}
            <Link
                href="/flights"
                className={`flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                    isFlightsActive
                        ? "text-primary font-bold"
                        : "text-muted-foreground hover:text-foreground"
                }`}
            >
                <div
                    className={`flex items-center justify-center rounded-full px-3 py-1 transition-all ${
                        isFlightsActive ? "bg-primary/10" : ""
                    }`}
                >
                    <Plane className="size-5" />
                </div>
                <span>{t("flights")}</span>
            </Link>

            {/* Hôtels */}
            <Link
                href="/hotels"
                className={`flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                    isHotelsActive
                        ? "text-primary font-bold"
                        : "text-muted-foreground hover:text-foreground"
                }`}
            >
                <div
                    className={`flex items-center justify-center rounded-full px-3 py-1 transition-all ${
                        isHotelsActive ? "bg-primary/10" : ""
                    }`}
                >
                    <Building2 className="size-5" />
                </div>
                <span>{t("hotels")}</span>
            </Link>

            {/* Devenir hôte */}
            <Link
                href="/become-host"
                className={`flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                    isBecomeHostActive
                        ? "text-primary font-bold"
                        : "text-muted-foreground hover:text-foreground"
                }`}
            >
                <div
                    className={`flex items-center justify-center rounded-full px-3 py-1 transition-all ${
                        isBecomeHostActive ? "bg-primary/10" : ""
                    }`}
                >
                    <Handshake className="size-5" />
                </div>
                <span>{t("becomeHost")}</span>
            </Link>

            {/* Profil / Connexion (Avec Bottom Sheet Modal si connecté) */}
            {isAuthenticated && user ? (
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <button
                            type="button"
                            className={`flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors outline-none ${
                                isDashboardActive
                                    ? "text-primary font-bold"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <div
                                className={`flex items-center justify-center rounded-full px-3 py-1 transition-all ${
                                    isDashboardActive ? "bg-primary/10" : ""
                                }`}
                            >
                                <User className="size-5" />
                            </div>
                            <span className="max-w-[55px] truncate">
                                {user.fullName?.split(" ")[0] || t("dashboard")}
                            </span>
                        </button>
                    </SheetTrigger>

                    <SheetContent
                        side="bottom"
                        className="rounded-t-3xl p-6 border-t shadow-2xl bg-background"
                    >
                        {/* En-tête profil */}
                        <SheetHeader className="text-left pb-4 border-b">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg shrink-0">
                                    {user.fullName?.charAt(0).toUpperCase() || "U"}
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <SheetTitle className="text-base font-bold text-foreground truncate">
                                        {user.fullName}
                                    </SheetTitle>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                        </SheetHeader>

                        {/* Liens du Modal Bottom Sheet */}
                        <div className="py-4 space-y-1.5">
                            {/* Tableau de bord client */}
                            <Link
                                href="/dashboard"
                                onClick={() => setOpen(false)}
                                className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/60 active:bg-muted transition-colors text-sm font-medium"
                            >
                                <div className="flex items-center gap-3 text-foreground">
                                    <LayoutDashboard className="h-5 w-5 text-primary" />
                                    <span>{t("dashboard")}</span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </Link>

                            {/* Espace Admin (si administrateur) */}
                            {isAdmin && (
                                <Link
                                    href="/admin"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-sm transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck className="h-5 w-5" />
                                        <span>{t("adminPanel")}</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            )}

                            {/* Mon Compte / Profil */}
                            <Link
                                href="/account"
                                onClick={() => setOpen(false)}
                                className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/60 active:bg-muted transition-colors text-sm font-medium"
                            >
                                <div className="flex items-center gap-3 text-foreground">
                                    <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    <span>{t("account")}</span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </Link>

                            <hr className="my-2 border-border/40" />

                            {/* Bouton de Déconnexion */}
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="w-full flex items-center justify-between p-3 rounded-2xl text-destructive hover:bg-destructive/10 active:bg-destructive/20 transition-colors text-sm font-semibold"
                            >
                                <div className="flex items-center gap-3">
                                    <LogOut className="h-5 w-5" />
                                    <span>{t("logout")}</span>
                                </div>
                            </button>
                        </div>
                    </SheetContent>
                </Sheet>
            ) : (
                <Link
                    href="/login"
                    className={`flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                        pathname.startsWith("/login") || pathname.startsWith("/register")
                            ? "text-primary font-bold"
                            : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    <div
                        className={`flex items-center justify-center rounded-full px-3 py-1 transition-all ${
                            pathname.startsWith("/login") ? "bg-primary/10" : ""
                        }`}
                    >
                        <LogIn className="size-5" />
                    </div>
                    <span>{t("login")}</span>
                </Link>
            )}
        </nav>
    );
}
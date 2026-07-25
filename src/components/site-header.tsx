"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  Plane,
  Building2,
  Globe,
  User,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  LogIn,
  Handshake,
} from "lucide-react";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SiteHeader() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const isFlightsActive = pathname.startsWith("/flights");
  const isHotelsActive = pathname.startsWith("/hotels");
  const isHomeActive = pathname === "/";
  const isDashboardActive = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
  const isBecomeHostActive = pathname.startsWith("/become-host");

  return (
      <>
        {/* 1. TOP HEADER (Toujours visible, simplifié sur mobile) */}
        <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/70 backdrop-blur-md transition-all duration-300">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

            {/* Logo & Brand */}
            <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
              <div className="relative size-50 overflow-hidden rounded-lg">
                <Image
                    src="/logo.png"
                    alt="Logo"
                    fill
                    className="object-contain"
                    priority
                />
              </div>

            </Link>

            {/* Navigation centrale (Desktop uniquement) */}
            <nav className="hidden items-center gap-1.5 sm:flex">
              <Button
                  asChild
                  variant={isFlightsActive ? "secondary" : "ghost"}
                  size="sm"
                  className={`gap-1.5 rounded-lg px-4 py-2 font-medium transition-all duration-200 ${
                      isFlightsActive
                          ? "bg-primary/10 text-primary hover:bg-primary/15"
                          : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <Link href="/flights" className="flex items-center gap-1.5">
                  <Plane className="size-4" />
                  {t("flights")}
                </Link>
              </Button>

              <Button
                  asChild
                  variant={isHotelsActive ? "secondary" : "ghost"}
                  size="sm"
                  className={`gap-1.5 rounded-lg px-4 py-2 font-medium transition-all duration-200 ${
                      isHotelsActive
                          ? "bg-primary/10 text-primary hover:bg-primary/15"
                          : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <Link href="/hotels" className="flex items-center gap-1.5">
                  <Building2 className="size-4" />
                  {t("hotels")}
                </Link>
              </Button>
            </nav>

            {/* Actions de droite (Devenir hôte + Langue + Connexion) */}
            <div className="flex items-center gap-2">

              {/* CTA Devenir hôte (Desktop uniquement) */}
              <Button
                  asChild
                  variant={isBecomeHostActive ? "secondary" : "outline"}
                  size="sm"
                  className={`hidden md:inline-flex gap-1.5 rounded-lg px-4 py-2 font-semibold transition-all duration-200 ${
                      isBecomeHostActive
                          ? "bg-primary/10 text-primary hover:bg-primary/15"
                          : "border-border/60 hover:bg-muted"
                  }`}
              >
                <Link href="/become-host" className="flex items-center gap-1.5">
                  <Handshake className="size-4" />
                  {t("becomeHost")}
                </Link>
              </Button>

              {/* Langue */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                      variant="ghost"
                      size="icon"
                      className="size-9 rounded-lg hover:bg-muted"
                      aria-label={t("language")}
                  >
                    <Globe className="size-[18px] text-muted-foreground transition-colors hover:text-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36 rounded-xl border-border/40 p-1">
                  {routing.locales.map((locale) => (
                      <DropdownMenuItem
                          key={locale}
                          onSelect={() => router.replace(pathname, { locale })}
                          className="cursor-pointer rounded-lg font-medium"
                      >
                        {locale === "fr" ? "Français" : "English"}
                      </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profil ou Connexion (Desktop uniquement) */}
              <div className="hidden sm:flex items-center gap-1.5">
                {isAuthenticated && user ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 gap-2 rounded-lg border-border/60 px-4 hover:bg-muted"
                        >
                          <User className="size-4 text-muted-foreground" />
                          <span className="text-sm font-semibold">
                        {user.fullName.split(" ")[0]}
                      </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 rounded-xl border-border/40 p-1">
                        <DropdownMenuItem disabled className="px-2.5 py-2 text-xs font-medium text-muted-foreground">
                          {t("greeting", { name: user.fullName })}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {isAdmin ? (
                            <DropdownMenuItem
                                onSelect={() => router.push("/admin")}
                                className="cursor-pointer gap-2 rounded-lg py-2 font-medium"
                            >
                              <ShieldCheck className="size-4 text-primary" />
                              {t("admin")}
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem
                                onSelect={() => router.push("/dashboard")}
                                className="cursor-pointer gap-2 rounded-lg py-2 font-medium"
                            >
                              <LayoutDashboard className="size-4 text-muted-foreground" />
                              {t("dashboard")}
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onSelect={logout}
                            className="cursor-pointer gap-2 rounded-lg py-2 font-medium text-destructive"
                        >
                          <LogOut className="size-4" />
                          {t("logout")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <div className="flex items-center gap-1.5">
                      <Button asChild variant="ghost" size="sm" className="h-9 rounded-lg font-medium text-muted-foreground hover:text-foreground">
                        <Link href="/login">{t("login")}</Link>
                      </Button>
                      <Button asChild size="sm" className="h-9 rounded-lg font-semibold shadow-sm shadow-primary/10">
                        <Link href="/register">{t("register")}</Link>
                      </Button>
                    </div>
                )}
              </div>

            </div>
          </div>
        </header>

        {/* 2. BOTTOM NAVIGATION MENU (Forcé en bas de l'écran sur mobile) */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-around border-t border-border/40 bg-background/90 px-2 pb-2 backdrop-blur-lg sm:hidden">

          {/* Onglet Accueil */}
          <Link
              href="/"
              className={`flex flex-col items-center justify-center gap-1 text-[9px] font-medium transition-colors ${
                  isHomeActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <div className={`flex items-center justify-center rounded-full px-3 py-1 transition-all ${
                isHomeActive ? "bg-primary/10" : ""
            }`}>
              <span className="text-lg">🏠</span>
            </div>
            <span>Accueil</span>
          </Link>

          {/* Onglet Vols */}
          <Link
              href="/flights"
              className={`flex flex-col items-center justify-center gap-1 text-[9px] font-medium transition-colors ${
                  isFlightsActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <div className={`flex items-center justify-center rounded-full px-3 py-1 transition-all ${
                isFlightsActive ? "bg-primary/10" : ""
            }`}>
              <Plane className="size-5" />
            </div>
            <span>{t("flights")}</span>
          </Link>

          {/* Onglet Hôtels */}
          <Link
              href="/hotels"
              className={`flex flex-col items-center justify-center gap-1 text-[9px] font-medium transition-colors ${
                  isHotelsActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <div className={`flex items-center justify-center rounded-full px-3 py-1 transition-all ${
                isHotelsActive ? "bg-primary/10" : ""
            }`}>
              <Building2 className="size-5" />
            </div>
            <span>{t("hotels")}</span>
          </Link>

          {/* Onglet Devenir hôte */}
          <Link
              href="/become-host"
              className={`flex flex-col items-center justify-center gap-1 text-[9px] font-medium transition-colors ${
                  isBecomeHostActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <div className={`flex items-center justify-center rounded-full px-3 py-1 transition-all ${
                isBecomeHostActive ? "bg-primary/10" : ""
            }`}>
              <Handshake className="size-5" />
            </div>
            <span>{t("becomeHost")}</span>
          </Link>

          {/* Onglet Profil / Espace Personnel */}
          {isAuthenticated && user ? (
              <Link
                  href={isAdmin ? "/admin" : "/dashboard"}
                  className={`flex flex-col items-center justify-center gap-1 text-[9px] font-medium transition-colors ${
                      isDashboardActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <div className={`flex items-center justify-center rounded-full px-3 py-1 transition-all ${
                    isDashboardActive ? "bg-primary/10" : ""
                }`}>
                  <User className="size-5" />
                </div>
                <span>{user.fullName.split(" ")[0]}</span>
              </Link>
          ) : (
              <Link
                  href="/login"
                  className={`flex flex-col items-center justify-center gap-1 text-[9px] font-medium transition-colors ${
                      pathname.startsWith("/login") || pathname.startsWith("/register") ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <div className={`flex items-center justify-center rounded-full px-3 py-1 transition-all ${
                    pathname.startsWith("/login") ? "bg-primary/10" : ""
                }`}>
                  <LogIn className="size-5" />
                </div>
                <span>{t("login")}</span>
              </Link>
          )}

        </nav>
      </>
  );
}
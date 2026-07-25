"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Mail, Phone, MapPin, ShieldCheck, ArrowUpRight } from "lucide-react";

import { Link } from "@/i18n/navigation";

const PAYMENT_BADGES = ["Visa", "Mastercard", "PayPal", "Amex"];

export function SiteFooter() {
  const t = useTranslations("Footer");
  const year = new Date().getFullYear();

  return (
      <footer className="relative w-full overflow-hidden bg-neutral-950 text-neutral-200 pb-20 sm:pb-0">

        {/* Arrière-plan stylisé : Dégradé radial pour un effet de halo lumineux moderne */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.12),rgba(255,255,255,0))]" />

        {/* Ligne de séparation supérieure en fondu (Glow effect) */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 lg:gap-16">

            {/* Marque + Description */}
            <div className="flex flex-col gap-5 md:col-span-5 lg:col-span-4">
              <Link href="/" className="group flex items-center gap-3 w-max">
                <div className="relative size-10 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 p-1.5 shadow-xl transition-transform duration-300 group-hover:scale-105">
                  <Image src="/logo.png" alt="Guen's Travel & Tours" fill className="object-contain" />
                </div>
                <span className="text-base font-black tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
                {t("tagline")}
              </span>
              </Link>

              <p className="text-sm leading-relaxed text-neutral-400 max-w-sm">
                {t("description")}
              </p>

              <ul className="mt-2 space-y-3 text-sm text-neutral-400">
                <li>
                  <a href="mailto:contact@guenstravelandtours.com" className="inline-flex items-center gap-3 transition-colors hover:text-white group">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-neutral-900 border border-neutral-800 shadow-inner transition-colors group-hover:bg-neutral-800 group-hover:text-white">
                    <Mail className="size-3.5" />
                  </span>
                    contact@guenstravelandtours.com
                  </a>
                </li>
                <li>
                  <a href="tel:+237600000000" className="inline-flex items-center gap-3 transition-colors hover:text-white group">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-neutral-900 border border-neutral-800 shadow-inner transition-colors group-hover:bg-neutral-800 group-hover:text-white">
                    <Phone className="size-3.5" />
                  </span>
                    +237 600 000 000
                  </a>
                </li>
                <li className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-500">
                  <MapPin className="size-3.5" />
                </span>
                  <span className="leading-tight">{t("contactAddress")}</span>
                </li>
              </ul>
            </div>

            {/* Navigation & Liens */}
            <div className="grid grid-cols-2 gap-8 md:col-span-7 lg:col-span-5">
              {/* Colonne 1 */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">{t("navTitle")}</h3>
                <ul className="space-y-3 text-sm text-neutral-400">
                  {[
                    { href: "/", label: t("navHome") },
                    { href: "/flights", label: t("navFlights") },
                    { href: "/hotels", label: t("navHotels") },
                    { href: "/dashboard", label: t("navDashboard") }
                  ].map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className="hover:text-white transition-colors hover:underline hover:underline-offset-4 decoration-neutral-500 decoration-2">
                          {link.label}
                        </Link>
                      </li>
                  ))}
                </ul>
              </div>

              {/* Colonne 2 */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">{t("supportTitle")}</h3>
                <ul className="space-y-3 text-sm text-neutral-400">
                  <li><a href="mailto:support@guenstravelandtours.com" className="inline-flex items-center gap-1 hover:text-white transition-colors group">{t("supportHelp")} <ArrowUpRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" /></a></li>
                  <li><a href="mailto:contact@guenstravelandtours.com" className="inline-flex items-center gap-1 hover:text-white transition-colors group">{t("supportContact")} <ArrowUpRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" /></a></li>
                  <li><Link href="/legal/terms" className="hover:text-white transition-colors">{t("supportTerms")}</Link></li>
                  <li><Link href="/legal/privacy" className="hover:text-white transition-colors">{t("supportPrivacy")}</Link></li>
                </ul>
              </div>
            </div>

            {/* Section Paiement & Certifications */}
            <div className="flex flex-col gap-4 md:col-span-12 lg:col-span-3 lg:border-l lg:border-neutral-800 lg:pl-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">{t("paymentTitle")}</h3>

              <div className="flex flex-wrap gap-1.5">
                {PAYMENT_BADGES.map((label) => (
                    <span
                        key={label}
                        className="rounded-lg border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
                    >
                  {label}
                </span>
                ))}
              </div>

              <div className="mt-2 inline-flex w-max items-center gap-2 rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-2 text-xs font-medium text-neutral-300">
                <ShieldCheck className="size-4 shrink-0 text-emerald-500" />
                <span>{t("securePaymentLabel")}</span>
              </div>
            </div>
          </div>

          {/* Barre de Copyright Basse */}
          <div className="mt-16 border-t border-neutral-900 pt-6 flex flex-col items-center gap-4 text-xs text-neutral-500 sm:flex-row sm:justify-between">
            <p>© {year} Guen's Travel & Tours. {t("rights")}</p>
            <div className="flex items-center gap-6 font-medium">
              <Link href="/legal/terms" className="hover:text-neutral-300 transition-colors">{t("supportTerms")}</Link>
              <Link href="/legal/privacy" className="hover:text-neutral-300 transition-colors">{t("supportPrivacy")}</Link>
            </div>
          </div>

        </div>
      </footer>
  );
}
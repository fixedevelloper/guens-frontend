"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Smartphone, Apple, QrCode } from "lucide-react";
import { motion } from "framer-motion";
import { useQRCode } from "next-qrcode";

export function AppPromo() {
    const t = useTranslations("AppPromo");
    const { Image } = useQRCode();

    // URL de téléchargement ou lien intelligent vers les stores
    const appDownloadUrl = "https://guentours.com/download";

    return (
        <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7bcd4f] via-[#65be38] to-[#489324] p-8 sm:p-12 lg:p-16 text-white shadow-2xl"
        >
            {/* Effets de lumière / Halos décoratifs en arrière-plan */}
            <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-black/15 blur-3xl pointer-events-none" />

            <div className="grid md:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
                {/* Texte & Boutons de téléchargement (8 colonnes sur large écran) */}
                <div className="md:col-span-7 lg:col-span-8 text-center md:text-left flex flex-col items-center md:items-start">

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/25 mb-5 shadow-sm">
                        <Smartphone className="h-4 w-4 text-white" />
                        <span className="uppercase tracking-wider text-xs font-bold text-white">
                            {t("badge")}
                        </span>
                    </div>

                    {/* Titre */}
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 tracking-tight leading-none text-white drop-shadow-sm">
                        {t("title")}
                    </h2>

                    {/* Description */}
                    <p className="text-emerald-50 text-base sm:text-lg mb-8 leading-relaxed max-w-xl font-medium">
                        {t("description")}
                    </p>

                    {/* Boutons d'action Stores */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center md:justify-start">
                        {/* App Store */}
                        <a
                            href="#"
                            className="group h-14 px-6 bg-white rounded-2xl flex items-center justify-center sm:justify-start gap-3.5 text-slate-900 font-semibold hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl hover:shadow-2xl"
                        >
                            <Apple className="h-8 w-8 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                            <div className="text-left">
                                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold leading-none">
                                    {t("appStoreSub")}
                                </div>
                                <div className="text-base font-extrabold mt-0.5 leading-none">
                                    App Store
                                </div>
                            </div>
                        </a>

                        {/* Google Play */}
                        <a
                            href="#"
                            className="group h-14 px-6 bg-white rounded-2xl flex items-center justify-center sm:justify-start gap-3.5 text-slate-900 font-semibold hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl hover:shadow-2xl"
                        >
                            <svg className="h-7 w-7 flex-shrink-0 text-slate-900 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.37,12.65L14.23,14.79L19.09,17.91L20.63,16.37C20.86,16.14 21,15.84 21,15.5V14.5C21,14.16 20.86,13.86 20.63,13.63L19.09,12.09L16.37,12.65M5.84,6.84L10.34,11.34L12.69,9L5.84,3.15C5.34,3.4 5,3.91 5,4.5V9.5C5,9.84 5.14,10.14 5.34,10.37L5.84,6.84Z"/>
                            </svg>
                            <div className="text-left">
                                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold leading-none">
                                    {t("googlePlaySub")}
                                </div>
                                <div className="text-base font-extrabold mt-0.5 leading-none">
                                    Google Play
                                </div>
                            </div>
                        </a>
                    </div>
                </div>

                {/* Bloc QR Code (Visible uniquement sur Écrans Moyens et Larges) */}
                <div className="hidden md:flex md:col-span-5 lg:col-span-4 justify-center md:justify-end">
                    <div className="bg-white/95 backdrop-blur-md p-5 rounded-3xl shadow-2xl border border-white/40 transform rotate-1 hover:rotate-0 transition-transform duration-500 text-center flex flex-col items-center">
                        <div className="p-2 bg-white rounded-2xl shadow-inner border border-slate-100 mb-3">
                            {Image ? (
                                <Image
                                    text={appDownloadUrl}
                                    options={{
                                        type: "image/jpeg",
                                        quality: 0.9,
                                        errorCorrectionLevel: "M",
                                        margin: 1,
                                        scale: 5,
                                        width: 160,
                                        color: {
                                            dark: "#0f172a",  // Noir/Slate foncé pour un scan optimal
                                            light: "#ffffff", // Fond blanc pur
                                        },
                                    }}
                                />
                            ) : (
                                <div className="w-40 h-40 bg-slate-100 flex items-center justify-center rounded-xl animate-pulse">
                                    <QrCode className="h-10 w-10 text-slate-400" />
                                </div>
                            )}
                        </div>

                        {/* Indication visuelle ergonomique */}
                        <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
                            <QrCode className="h-4 w-4 text-[#65be38]" />
                            <span>{t("scanToDownload")}</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}
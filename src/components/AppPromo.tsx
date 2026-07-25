"use client";

import React, {useEffect, useState} from "react";
import { useTranslations } from "next-intl";
import { Smartphone, Apple } from "lucide-react";
import { motion } from "framer-motion";
import QRCode from "qrcode";

export function AppPromo() {
    const t = useTranslations("AppPromo");
    const [qr, setQr] = useState("");

    useEffect(() => {
        QRCode.toDataURL("https://travel.guens.org/fr")
            .then(setQr)
            .catch(console.error);
    }, []);

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#7bcd4f] rounded-1xl p-6 sm:p-8 md:p-12 text-white overflow-hidden relative"
        >
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
                {/* Texte et Boutons */}
                <div className="text-center md:text-left flex flex-col items-center md:items-start">
                    <div className="flex items-center gap-2 mb-3 opacity-90">
                        <Smartphone className="h-5 w-5 md:h-6 md:w-6" />
                        <span className="uppercase tracking-widest text-xs md:text-sm font-bold">{t("badge")}</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 max-w-md md:max-w-none leading-tight">
                        {t("title")}
                    </h2>

                    <p className="text-green-50 text-sm sm:text-base md:text-lg mb-6 md:mb-8 leading-relaxed max-w-xl">
                        {t("description")}
                    </p>

                    {/* Boutons de téléchargement réactifs */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center md:justify-start">
                        {/* App Store */}
                        <a
                            href="#"
                            className="h-14 px-6 bg-white rounded-xl flex items-center justify-center sm:justify-start gap-3 text-zinc-900 font-semibold cursor-pointer hover:bg-zinc-100 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                            <Apple className="h-7 w-7 flex-shrink-0" />
                            <div className="text-left">
                                <div className="text-[10px] uppercase tracking-wide text-zinc-500 leading-none">Download on the</div>
                                <div className="text-base font-bold mt-0.5">App Store</div>
                            </div>
                        </a>

                        {/* Google Play */}
                        <a
                            href="#"
                            className="h-14 px-6 bg-white rounded-xl flex items-center justify-center sm:justify-start gap-3 text-zinc-900 font-semibold cursor-pointer hover:bg-zinc-100 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                            <svg className="h-6 w-6 flex-shrink-0 text-zinc-900" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.37,12.65L14.23,14.79L19.09,17.91L20.63,16.37C20.86,16.14 21,15.84 21,15.5V14.5C21,14.16 20.86,13.86 20.63,13.63L19.09,12.09L16.37,12.65M5.84,6.84L10.34,11.34L12.69,9L5.84,3.15C5.34,3.4 5,3.91 5,4.5V9.5C5,9.84 5.14,10.14 5.34,10.37L5.84,6.84Z"/>
                            </svg>
                            <div className="text-left">
                                <div className="text-[10px] uppercase tracking-wide text-zinc-500 leading-none">Get it on</div>
                                <div className="text-base font-bold mt-0.5">Google Play</div>
                            </div>
                        </a>
                    </div>
                </div>

                {/* Espace QR Code caché sur les très petits écrans ou réduit intelligemment */}
                <div className="flex justify-center md:justify-end mt-4 md:mt-0">
                    <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-xl transform rotate-0 sm:rotate-3 hover:rotate-0 transition-transform duration-500">
                        <div className="w-28 h-28 sm:w-36 sm:h-36 bg-zinc-900 flex items-center justify-center rounded-lg">
                            {qr ? (
                                <img src={qr} alt="QR Code" className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg" />
                            ) : (
                                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-zinc-200 flex items-center justify-center rounded-lg">
                                    <span className="text-zinc-500 text-xs sm:text-sm">Loading...</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}
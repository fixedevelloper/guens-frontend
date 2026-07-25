"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Plane } from "lucide-react";

export interface DynamicFlightLoaderProps {
    isPending: boolean;
}

export function DynamicFlightLoader({ isPending }: DynamicFlightLoaderProps) {
    const t = useTranslations("FlightLoader");

    const loadingSteps = [
        {
            title: t("steps.0.title"),
            description: t("steps.0.description"),
        },
        {
            title: t("steps.1.title"),
            description: t("steps.1.description"),
        },
        {
            title: t("steps.2.title"),
            description: t("steps.2.description"),
        },
        {
            title: t("steps.3.title"),
            description: t("steps.3.description"),
        },
    ];

    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (!isPending) return;

        const interval = setInterval(() => {
            setCurrentStep((prev) => (prev + 1) % loadingSteps.length);
        }, 3500);

        return () => clearInterval(interval);
    }, [isPending, loadingSteps.length]);

    if (!isPending) return null;

    return (
        <div className="flex flex-col items-center justify-center p-12 sm:p-24 space-y-6 bg-zinc-50/50 rounded-3xl border border-zinc-100 min-h-[60vh]">
            <div className="relative flex items-center justify-center">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-zinc-200 border-t-primary" />
                <Plane className="h-6 w-6 text-primary absolute animate-pulse" />
            </div>

            <div key={currentStep} className="text-center space-y-2 px-4 transition-all duration-500">
                <h3 className="text-lg sm:text-xl font-bold text-zinc-900">
                    {loadingSteps[currentStep].title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 max-w-sm mx-auto leading-relaxed">
                    {loadingSteps[currentStep].description}
                </p>
            </div>
        </div>
    );
}

export default DynamicFlightLoader;
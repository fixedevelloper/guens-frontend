"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, FileImage, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { normalizeApiError } from "@/lib/api/client";
import { useUploadRequiredPassportImageMutation } from "@/hooks/use-booking";
import type { BookingTravelerResponse } from "@/lib/api/types";

interface PassportImageRequirementPanelProps {
    bookingId: string;
    travelers: BookingTravelerResponse[];
}

/**
 * Blocks payment until every traveler the provider flagged (see BookingTravelerResponse
 * #passportImageRequired) has a passport image uploaded - see PaymentService#pay's matching
 * backend check. Shown on the payment page instead of PaymentForm while anything here is still
 * unresolved.
 */
export function PassportImageRequirementPanel({ bookingId, travelers }: PassportImageRequirementPanelProps) {
    const t = useTranslations("Payment");
    const uploadMutation = useUploadRequiredPassportImageMutation(bookingId);
    const [pendingIndex, setPendingIndex] = useState<number | null>(null);

    function handleFileChange(travelerIndex: number, file: File | null) {
        if (!file) return;
        setPendingIndex(travelerIndex);
        uploadMutation.mutate(
            { travelerIndex, file },
            {
                onSuccess: () => setPendingIndex(null),
                onError: (error) => {
                    toast.error(normalizeApiError(error).message);
                    setPendingIndex(null);
                },
            }
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-start gap-2.5 rounded-2xl border border-amber-500/25 bg-amber-500/[0.04] p-4 text-amber-950 dark:text-amber-200">
                <ShieldAlert className="size-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <p className="text-xs font-semibold leading-relaxed">
                    {t("passportImageRequiredNotice")}
                </p>
            </div>

            <div className="space-y-2.5">
                {travelers.map((traveler, index) => {
                    if (!traveler.passportImageRequired) return null;
                    const isUploaded = Boolean(traveler.passportImageUrl);
                    const isUploading = uploadMutation.isPending && pendingIndex === index;
                    return (
                        <div
                            key={index}
                            className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-slate-50/40 dark:bg-zinc-900/20 p-4"
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <FileImage className="size-4 text-muted-foreground shrink-0" />
                                <span className="text-sm font-semibold truncate">{traveler.fullName}</span>
                            </div>
                            {isUploaded ? (
                                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 shrink-0">
                                    <Check className="size-4" />
                                    {t("passportImageUploaded")}
                                </span>
                            ) : (
                                <label className="shrink-0 cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        disabled={isUploading}
                                        onChange={(e) => handleFileChange(index, e.target.files?.[0] ?? null)}
                                    />
                                    <span className="flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-colors">
                                        {isUploading && <Loader2 className="size-3.5 animate-spin" />}
                                        {t("passportImageUploadAction")}
                                    </span>
                                </label>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

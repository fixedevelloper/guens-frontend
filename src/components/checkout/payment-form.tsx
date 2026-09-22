"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { CreditCard, Smartphone, Wallet, Copy, Check, Loader2, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CountrySelect } from "./country-select";
import { useManualPaymentInfoQuery } from "@/hooks/use-payment";
import { formatMoney } from "@/lib/format";
import type { Money } from "@/lib/api/types";

export const PAYMENT_METHODS = ["CARD", "MOBILE_MONEY", "GOOGLE_PAY", "APPLE_PAY", "PAYPAL"] as const;
export type PaymentMethodOption = (typeof PAYMENT_METHODS)[number];

export type PaymentFormValues = {
    countryCode: string;
    currency: string;
    paymentMethod: PaymentMethodOption;
    mobileNumber?: string;
    customerReference?: string;
};

type PaymentFormProps = {
    onSubmit: (values: PaymentFormValues) => void;
    isSubmitting: boolean;
    defaultCountryCode?: string;
    defaultCurrency?: string;
    /** Displayed inside the manual-payment panel so the customer doesn't have to scroll back up
     *  while completing the mobile money transfer - see ManualPaymentPanel below. */
    amountDue?: Money;
    locale: string;
};

/**
 * CARD/GOOGLE_PAY/APPLE_PAY/PAYPAL collect nothing here beyond country/currency: they route to
 * Stripe, which creates a PaymentIntent from just this, then collects card/wallet details itself
 * via its own Payment Element (see StripeCheckoutDialog) - card numbers and billing addresses
 * never pass through this form or this backend. Only MOBILE_MONEY (stays on Flutterwave, which
 * Stripe doesn't support) still needs a field collected here.
 *
 * When the selected country is in manual/agent-confirmed payment mode (see
 * ManualPaymentGateway/GET /api/payments/manual-info), the method selector and card/wallet
 * explanation above are replaced entirely by ManualPaymentPanel: merchant codes to pay to, plus a
 * transaction-reference field an agent will use to confirm the payment by hand later.
 */
export function PaymentForm({
                                onSubmit,
                                isSubmitting,
                                defaultCountryCode,
                                defaultCurrency,
                                amountDue,
                                locale,
                            }: PaymentFormProps) {
    const t = useTranslations("Payment");

    const methodConfig: Record<PaymentMethodOption, { label: string; icon: typeof CreditCard }> = useMemo(
        () => ({
            CARD: { label: t("methodCard"), icon: CreditCard },
            MOBILE_MONEY: { label: "Mobile Money", icon: Smartphone },
            GOOGLE_PAY: { label: "Google Pay", icon: Wallet },
            APPLE_PAY: { label: "Apple Pay", icon: Wallet },
            PAYPAL: { label: "PayPal", icon: Wallet },
        }),
        [t]
    );

    const paymentFormSchema = useMemo(
        () =>
            z
                .object({
                    countryCode: z.string().length(2, t("countryRequired")),
                    currency: z.string().min(3),
                    paymentMethod: z.enum(PAYMENT_METHODS),
                    mobileNumber: z.string().optional(),
                    customerReference: z.string().optional(),
                })
                .superRefine((data, ctx) => {
                    if (data.paymentMethod === "MOBILE_MONEY") {
                        if (!data.mobileNumber || !/^\+?\d{8,15}$/.test(data.mobileNumber.replace(/\s+/g, ""))) {
                            ctx.addIssue({ code: "custom", path: ["mobileNumber"], message: t("mobileNumberInvalid") });
                        }
                    }
                }),
        [t]
    );

    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(paymentFormSchema),
        defaultValues: {
            countryCode: defaultCountryCode ?? "",
            currency: defaultCurrency ?? "",
            paymentMethod: "CARD",
            mobileNumber: "",
            customerReference: "",
        },
    });

    const method = form.watch("paymentMethod");
    const countryCode = form.watch("countryCode");
    const manualInfoQuery = useManualPaymentInfoQuery(countryCode || undefined);
    const isManual = manualInfoQuery.data?.manual ?? false;
    const checkingManualMode = manualInfoQuery.isLoading && countryCode.length === 2;

    // Manual mode only ever submits as a mobile money charge (the customer pays via mobile money
    // to the merchant code shown below) - forcing it here reuses the existing MOBILE_MONEY
    // validation/payload shape as-is instead of duplicating it for a separate "MANUAL" value.
    useEffect(() => {
        if (isManual && method !== "MOBILE_MONEY") {
            form.setValue("paymentMethod", "MOBILE_MONEY", { shouldValidate: true });
        }
    }, [isManual, method, form]);

    const handleFormSubmit = (data: PaymentFormValues) => {
        if (isManual && !data.customerReference?.trim()) {
            form.setError("customerReference", {
                message: t("manualReferenceRequired"),
            });
            return;
        }

        const payload: PaymentFormValues = {
            countryCode: data.countryCode,
            currency: data.currency,
            paymentMethod: data.paymentMethod,
        };

        if (data.paymentMethod === "MOBILE_MONEY") {
            payload.mobileNumber = data.mobileNumber?.replace(/\s+/g, "");
        }
        if (isManual) {
            payload.customerReference = data.customerReference?.trim();
        }

        onSubmit(payload);
    };

    return (
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-5 sm:space-y-6">
            <div className="space-y-2">
                <Label className="text-xs font-bold sm:text-sm">{t("billingCountry")}</Label>
                <CountrySelect
                    value={countryCode}
                    onChange={(iso2, currency) => {
                        form.setValue("countryCode", iso2, { shouldValidate: true });
                        form.setValue("currency", currency, { shouldValidate: true });
                    }}
                    disabled={isSubmitting}
                />
                {form.formState.errors.countryCode && (
                    <p className="text-xs font-semibold text-destructive">
                        {form.formState.errors.countryCode.message}
                    </p>
                )}
            </div>

            {checkingManualMode ? (
                <div className="flex items-center gap-2 rounded-2xl border border-dashed p-4 text-xs font-semibold text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin" />
                    {t("checkingManualMode")}
                </div>
            ) : isManual ? (
                <ManualPaymentPanel
                    merchantCodes={manualInfoQuery.data?.merchantCodes ?? []}
                    amountDue={amountDue}
                    locale={locale}
                    mobileNumberError={form.formState.errors.mobileNumber?.message}
                    referenceError={form.formState.errors.customerReference?.message}
                    isSubmitting={isSubmitting}
                    registerMobileNumber={form.register("mobileNumber")}
                    registerReference={form.register("customerReference")}
                />
            ) : (
                <>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold sm:text-sm">{t("paymentMethodLabel")}</Label>
                        <Tabs
                            value={method}
                            onValueChange={(value) => {
                                const next = value as PaymentMethodOption;
                                form.setValue("paymentMethod", next, { shouldValidate: true });
                            }}
                        >
                            <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-2xl p-1 sm:grid-cols-3 lg:grid-cols-5">
                                {PAYMENT_METHODS.map((m) => {
                                    const Icon = methodConfig[m].icon;
                                    return (
                                        <TabsTrigger
                                            key={m}
                                            value={m}
                                            className="flex h-auto flex-col gap-1 rounded-xl px-3 py-3 text-[10px] font-bold sm:px-4"
                                        >
                                            <Icon className="size-4 sm:size-5" />
                                            <span className="leading-tight">{methodConfig[m].label}</span>
                                        </TabsTrigger>
                                    );
                                })}
                            </TabsList>
                        </Tabs>
                    </div>

                    {method === "MOBILE_MONEY" && (
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold">{t("mobileNumber")}</Label>
                            <Input
                                placeholder="+237 6XX XXX XXX"
                                {...form.register("mobileNumber")}
                                disabled={isSubmitting}
                                className="rounded-xl"
                            />
                            {form.formState.errors.mobileNumber && (
                                <p className="text-xs font-semibold text-destructive">
                                    {form.formState.errors.mobileNumber.message}
                                </p>
                            )}
                        </div>
                    )}

                    {method !== "MOBILE_MONEY" && (
                        <p className="text-xs font-semibold text-muted-foreground rounded-2xl border border-dashed p-4">
                            {t("cardNotice")}
                        </p>
                    )}
                </>
            )}

            <Button
                type="submit"
                className="w-full rounded-xl py-6 font-bold sm:py-5"
                disabled={isSubmitting || !countryCode || checkingManualMode}
            >
                {isSubmitting
                    ? t("processing")
                    : isManual
                        ? t("submitManualPayment")
                        : t("continueAction")}
            </Button>
        </form>
    );
}

type ManualPaymentPanelProps = {
    merchantCodes: { id: string; operatorName: string; code: string; instructions: string | null }[];
    amountDue?: Money;
    locale: string;
    mobileNumberError?: string;
    referenceError?: string;
    isSubmitting: boolean;
    registerMobileNumber: UseFormRegisterReturn<"mobileNumber">;
    registerReference: UseFormRegisterReturn<"customerReference">;
};

/**
 * Shown instead of the normal method selector when GET /api/payments/manual-info says this
 * country has no automated payment API ready yet (see ManualPaymentGateway): the customer pays a
 * merchant code out-of-band, then submits their transaction reference so an agent can confirm the
 * payment by hand from the AgentPaymentController dashboard.
 */
function ManualPaymentPanel({
                                merchantCodes,
                                amountDue,
                                locale,
                                mobileNumberError,
                                referenceError,
                                isSubmitting,
                                registerMobileNumber,
                                registerReference,
                            }: ManualPaymentPanelProps) {
    const t = useTranslations("Payment");
    const [copiedId, setCopiedId] = useState<string | null>(null);

    function handleCopy(id: string, code: string) {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 2000);
    }

    return (
        <div className="space-y-4">
            <div className="flex items-start gap-2.5 rounded-2xl border border-amber-500/25 bg-amber-500/[0.04] p-4 text-amber-950 dark:text-amber-200">
                <ShieldAlert className="size-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <p className="text-xs font-semibold leading-relaxed">
                    {t("manualInstructions", { amount: amountDue ? formatMoney(amountDue, locale) : "" })}
                </p>
            </div>

            {merchantCodes.length === 0 ? (
                <p className="text-xs font-semibold text-muted-foreground rounded-2xl border border-dashed p-4">
                    {t("noMerchantCodes")}
                </p>
            ) : (
                <div className="space-y-2.5">
                    {merchantCodes.map((merchantCode) => (
                        <div
                            key={merchantCode.id}
                            className="rounded-xl border border-border/50 bg-slate-50/40 dark:bg-zinc-900/20 p-4 space-y-1.5"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-foreground">{merchantCode.operatorName}</span>
                                <button
                                    type="button"
                                    onClick={() => handleCopy(merchantCode.id, merchantCode.code)}
                                    className="flex items-center gap-1 rounded-lg border border-border/60 px-2 py-1 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {copiedId === merchantCode.id ? (
                                        <Check className="size-3" />
                                    ) : (
                                        <Copy className="size-3" />
                                    )}
                                    {copiedId === merchantCode.id ? t("copiedCode") : t("copyCode")}
                                </button>
                            </div>
                            <p className="font-mono text-lg font-black tracking-wide text-foreground">
                                {merchantCode.code}
                            </p>
                            {merchantCode.instructions && (
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    {merchantCode.instructions}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="space-y-1.5">
                <Label className="text-xs font-bold">{t("manualMobileNumberLabel")}</Label>
                <Input
                    placeholder="+237 6XX XXX XXX"
                    {...registerMobileNumber}
                    disabled={isSubmitting}
                    className="rounded-xl"
                />
                {mobileNumberError && (
                    <p className="text-xs font-semibold text-destructive">{mobileNumberError}</p>
                )}
            </div>

            <div className="space-y-1.5">
                <Label className="text-xs font-bold">{t("manualReferenceLabel")}</Label>
                <Input
                    placeholder="Ex: MP240921.1234.A56789"
                    {...registerReference}
                    disabled={isSubmitting}
                    className="rounded-xl font-mono"
                />
                {referenceError && (
                    <p className="text-xs font-semibold text-destructive">{referenceError}</p>
                )}
            </div>
        </div>
    );
}

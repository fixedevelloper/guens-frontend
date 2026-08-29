"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreditCard, Smartphone, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CountrySelect } from "./country-select";

export const PAYMENT_METHODS = ["CARD", "MOBILE_MONEY", "GOOGLE_PAY", "APPLE_PAY", "PAYPAL"] as const;
export type PaymentMethodOption = (typeof PAYMENT_METHODS)[number];

const paymentFormSchema = z
    .object({
        countryCode: z.string().length(2, "Sélectionne un pays"),
        currency: z.string().min(3),
        paymentMethod: z.enum(PAYMENT_METHODS),
        mobileNumber: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.paymentMethod === "MOBILE_MONEY") {
            if (!data.mobileNumber || !/^\+?\d{8,15}$/.test(data.mobileNumber.replace(/\s+/g, ""))) {
                ctx.addIssue({ code: "custom", path: ["mobileNumber"], message: "Numéro invalide" });
            }
        }
    });

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;

const METHOD_CONFIG: Record<PaymentMethodOption, { label: string; icon: typeof CreditCard }> = {
    CARD: { label: "Carte bancaire", icon: CreditCard },
    MOBILE_MONEY: { label: "Mobile Money", icon: Smartphone },
    GOOGLE_PAY: { label: "Google Pay", icon: Wallet },
    APPLE_PAY: { label: "Apple Pay", icon: Wallet },
    PAYPAL: { label: "PayPal", icon: Wallet },
};

type PaymentFormProps = {
    onSubmit: (values: PaymentFormValues) => void;
    isSubmitting: boolean;
    defaultCountryCode?: string;
    defaultCurrency?: string;
};

/**
 * CARD/GOOGLE_PAY/APPLE_PAY/PAYPAL collect nothing here beyond country/currency: they route to
 * Stripe, which creates a PaymentIntent from just this, then collects card/wallet details itself
 * via its own Payment Element (see StripeCheckoutDialog) - card numbers and billing addresses
 * never pass through this form or this backend. Only MOBILE_MONEY (stays on Flutterwave, which
 * Stripe doesn't support) still needs a field collected here.
 */
export function PaymentForm({
                                onSubmit,
                                isSubmitting,
                                defaultCountryCode,
                                defaultCurrency,
                            }: PaymentFormProps) {
    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(paymentFormSchema),
        defaultValues: {
            countryCode: defaultCountryCode ?? "",
            currency: defaultCurrency ?? "",
            paymentMethod: "CARD",
            mobileNumber: "",
        },
    });

    const method = form.watch("paymentMethod");
    const countryCode = form.watch("countryCode");

    const handleFormSubmit = (data: PaymentFormValues) => {
        const payload: PaymentFormValues = {
            countryCode: data.countryCode,
            currency: data.currency,
            paymentMethod: data.paymentMethod,
        };

        if (data.paymentMethod === "MOBILE_MONEY") {
            payload.mobileNumber = data.mobileNumber?.replace(/\s+/g, "");
        }

        onSubmit(payload);
    };

    return (
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-5 sm:space-y-6">
            <div className="space-y-2">
                <Label className="text-xs font-bold sm:text-sm">Pays de facturation</Label>
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

            <div className="space-y-2">
                <Label className="text-xs font-bold sm:text-sm">Mode de règlement</Label>
                <Tabs
                    value={method}
                    onValueChange={(value) => {
                        const next = value as PaymentMethodOption;
                        form.setValue("paymentMethod", next, { shouldValidate: true });
                    }}
                >
                    <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-2xl p-1 sm:grid-cols-3 lg:grid-cols-5">
                        {PAYMENT_METHODS.map((m) => {
                            const Icon = METHOD_CONFIG[m].icon;
                            return (
                                <TabsTrigger
                                    key={m}
                                    value={m}
                                    className="flex h-auto flex-col gap-1 rounded-xl px-3 py-3 text-[10px] font-bold sm:px-4"
                                >
                                    <Icon className="size-4 sm:size-5" />
                                    <span className="leading-tight">{METHOD_CONFIG[m].label}</span>
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>
                </Tabs>
            </div>

            {method === "MOBILE_MONEY" && (
                <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Numéro mobile money</Label>
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
                    Tu saisiras tes informations de paiement à l&apos;étape suivante, directement et en
                    toute sécurité chez notre partenaire de paiement Stripe.
                </p>
            )}

            <Button
                type="submit"
                className="w-full rounded-xl py-6 font-bold sm:py-5"
                disabled={isSubmitting || !countryCode}
            >
                {isSubmitting ? "Traitement en cours..." : "Continuer"}
            </Button>
        </form>
    );
}

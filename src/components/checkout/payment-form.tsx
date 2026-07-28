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

const REQUIRES_BILLING_ADDRESS: ReadonlySet<PaymentMethodOption> = new Set([
    "GOOGLE_PAY",
    "APPLE_PAY",
    "PAYPAL",
]);

const paymentFormSchema = z
    .object({
        countryCode: z.string().length(2, "Sélectionne un pays"),
        currency: z.string().min(3),
        paymentMethod: z.enum(PAYMENT_METHODS),
        cardNumber: z.string().optional(),
        cardHolderName: z.string().optional(),
        expiry: z.string().optional(),
        cvv: z.string().optional(),
        mobileNumber: z.string().optional(),
        billingZipCode: z.string().optional(),
        billingCity: z.string().optional(),
        billingAddress: z.string().optional(),
        billingState: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.paymentMethod === "CARD") {
            if (!data.cardNumber || !/^\d{12,19}$/.test(data.cardNumber.replace(/\s+/g, ""))) {
                ctx.addIssue({ code: "custom", path: ["cardNumber"], message: "Numéro de carte invalide" });
            }
            if (!data.cardHolderName?.trim()) {
                ctx.addIssue({ code: "custom", path: ["cardHolderName"], message: "Nom du titulaire requis" });
            }
            if (!data.expiry || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(data.expiry)) {
                ctx.addIssue({ code: "custom", path: ["expiry"], message: "Format MM/AA attendu" });
            }
            if (!data.cvv || !/^\d{3,4}$/.test(data.cvv)) {
                ctx.addIssue({ code: "custom", path: ["cvv"], message: "CVV invalide" });
            }
        }

        if (data.paymentMethod === "MOBILE_MONEY") {
            if (!data.mobileNumber || !/^\+?\d{8,15}$/.test(data.mobileNumber.replace(/\s+/g, ""))) {
                ctx.addIssue({ code: "custom", path: ["mobileNumber"], message: "Numéro invalide" });
            }
        }

        if (REQUIRES_BILLING_ADDRESS.has(data.paymentMethod)) {
            if (!data.billingAddress?.trim()) {
                ctx.addIssue({ code: "custom", path: ["billingAddress"], message: "Adresse requise" });
            }
            if (!data.billingCity?.trim()) {
                ctx.addIssue({ code: "custom", path: ["billingCity"], message: "Ville requise" });
            }
            if (!data.billingZipCode?.trim()) {
                ctx.addIssue({ code: "custom", path: ["billingZipCode"], message: "Code postal requis" });
            }
            if (!data.billingState?.trim()) {
                ctx.addIssue({ code: "custom", path: ["billingState"], message: "Région/État requis" });
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
            cardNumber: "",
            cardHolderName: "",
            expiry: "",
            cvv: "",
            mobileNumber: "",
            billingZipCode: "",
            billingCity: "",
            billingAddress: "",
            billingState: "",
        },
    });

    const method = form.watch("paymentMethod");
    const countryCode = form.watch("countryCode");
    const requiresBillingAddress = REQUIRES_BILLING_ADDRESS.has(method);

    const handleFormSubmit = (data: PaymentFormValues) => {
        // Filtrage des données inutiles selon le mode de paiement
        const payload: PaymentFormValues = {
            countryCode: data.countryCode,
            currency: data.currency,
            paymentMethod: data.paymentMethod,
        };

        if (data.paymentMethod === "CARD") {
            payload.cardNumber = data.cardNumber?.replace(/\s+/g, "");
            payload.cardHolderName = data.cardHolderName?.trim();
            payload.expiry = data.expiry;
            payload.cvv = data.cvv;
        } else if (data.paymentMethod === "MOBILE_MONEY") {
            payload.mobileNumber = data.mobileNumber?.replace(/\s+/g, "");
        }

        if (REQUIRES_BILLING_ADDRESS.has(data.paymentMethod)) {
            payload.billingAddress = data.billingAddress?.trim();
            payload.billingCity = data.billingCity?.trim();
            payload.billingZipCode = data.billingZipCode?.trim();
            payload.billingState = data.billingState?.trim();
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

            {method === "CARD" && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs font-bold">Numéro de carte</Label>
                        <Input
                            inputMode="numeric"
                            placeholder="4242 4242 4242 4242"
                            {...form.register("cardNumber")}
                            disabled={isSubmitting}
                            className="rounded-xl"
                        />
                        {form.formState.errors.cardNumber && (
                            <p className="text-xs font-semibold text-destructive">
                                {form.formState.errors.cardNumber.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs font-bold">Nom du titulaire</Label>
                        <Input
                            placeholder="Jean Dupont"
                            {...form.register("cardHolderName")}
                            disabled={isSubmitting}
                            className="rounded-xl"
                        />
                        {form.formState.errors.cardHolderName && (
                            <p className="text-xs font-semibold text-destructive">
                                {form.formState.errors.cardHolderName.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold">Expiration (MM/AA)</Label>
                        <Input
                            placeholder="12/28"
                            {...form.register("expiry")}
                            disabled={isSubmitting}
                            className="rounded-xl"
                        />
                        {form.formState.errors.expiry && (
                            <p className="text-xs font-semibold text-destructive">
                                {form.formState.errors.expiry.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold">CVV</Label>
                        <Input
                            placeholder="123"
                            {...form.register("cvv")}
                            disabled={isSubmitting}
                            className="rounded-xl"
                        />
                        {form.formState.errors.cvv && (
                            <p className="text-xs font-semibold text-destructive">
                                {form.formState.errors.cvv.message}
                            </p>
                        )}
                    </div>
                </div>
            )}

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

            {requiresBillingAddress && (
                <div className="space-y-4 rounded-2xl border border-dashed p-4">
                    <p className="text-xs font-semibold text-muted-foreground">
                        Adresse de facturation requise pour {METHOD_CONFIG[method].label}. Tu seras ensuite
                        redirigé pour finaliser le paiement en toute sécurité.
                    </p>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5 sm:col-span-2">
                            <Label className="text-xs font-bold">Adresse</Label>
                            <Input
                                placeholder="3563 Huntertown Rd"
                                {...form.register("billingAddress")}
                                disabled={isSubmitting}
                                className="rounded-xl"
                            />
                            {form.formState.errors.billingAddress && (
                                <p className="text-xs font-semibold text-destructive">
                                    {form.formState.errors.billingAddress.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold">Ville</Label>
                            <Input
                                placeholder="Douala"
                                {...form.register("billingCity")}
                                disabled={isSubmitting}
                                className="rounded-xl"
                            />
                            {form.formState.errors.billingCity && (
                                <p className="text-xs font-semibold text-destructive">
                                    {form.formState.errors.billingCity.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold">Code postal</Label>
                            <Input
                                placeholder="00237"
                                {...form.register("billingZipCode")}
                                disabled={isSubmitting}
                                className="rounded-xl"
                            />
                            {form.formState.errors.billingZipCode && (
                                <p className="text-xs font-semibold text-destructive">
                                    {form.formState.errors.billingZipCode.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5 sm:col-span-2">
                            <Label className="text-xs font-bold">Région / État</Label>
                            <Input
                                placeholder="Littoral"
                                {...form.register("billingState")}
                                disabled={isSubmitting}
                                className="rounded-xl"
                            />
                            {form.formState.errors.billingState && (
                                <p className="text-xs font-semibold text-destructive">
                                    {form.formState.errors.billingState.message}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <Button
                type="submit"
                className="w-full rounded-xl py-6 font-bold sm:py-5"
                disabled={isSubmitting || !countryCode}
            >
                {isSubmitting ? "Traitement en cours..." : "Payer"}
            </Button>
        </form>
    );
}
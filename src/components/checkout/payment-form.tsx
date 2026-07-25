// components/checkout/payment-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { CreditCard, Lock, Smartphone, ShieldCheck, Check } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/lib/api/types";

const schema = z.object({
  paymentMethod: z.enum(["CARD", "MTN_MOBILE_MONEY", "ORANGE_MONEY"]),
  cardNumber: z.string().trim().optional(),
  cardHolderName: z.string().trim().optional(),
  expiry: z.string().trim().optional(),
  cvv: z.string().trim().optional(),
  mobileNumber: z.string().trim().optional(),
});

export type PaymentFormValues = z.infer<typeof schema>;

interface PaymentFormProps {
  onSubmit: (values: PaymentFormValues) => void;
  isSubmitting: boolean;
}

const METHODS: { 
  value: PaymentMethod; 
  labelKey: "methodCard" | "methodMtn" | "methodOrange";
  colorClass: string;
}[] = [
  { value: "CARD", labelKey: "methodCard", colorClass: "active:border-primary active:bg-primary/5" },
  { value: "MTN_MOBILE_MONEY", labelKey: "methodMtn", colorClass: "active:border-amber-500 active:bg-amber-500/5 dark:active:bg-amber-500/10" },
  { value: "ORANGE_MONEY", labelKey: "methodOrange", colorClass: "active:border-orange-500 active:bg-orange-500/5 dark:active:bg-orange-500/10" },
];

export function PaymentForm({ onSubmit, isSubmitting }: PaymentFormProps) {
  const t = useTranslations("Payment");

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      paymentMethod: "CARD",
      cardNumber: "",
      cardHolderName: "",
      expiry: "",
      cvv: "",
      mobileNumber: "",
    },
  });

  const paymentMethod = form.watch("paymentMethod");
  const isMobileMoney = paymentMethod !== "CARD";

  function handleSubmit(values: PaymentFormValues) {
    if (values.paymentMethod === "CARD") {
      let hasError = false;
      if (!values.cardNumber?.match(/^\d{12,19}$/)) {
        form.setError("cardNumber", { message: t("cardNumberInvalid") ?? "Numéro de carte invalide" });
        hasError = true;
      }
      if (!values.cardHolderName?.trim()) {
        form.setError("cardHolderName", { message: t("cardHolderRequired") ?? "Nom requis" });
        hasError = true;
      }
      if (!values.expiry?.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
        form.setError("expiry", { message: t("expiryInvalid") ?? "Format requis (MM/AA)" });
        hasError = true;
      }
      if (!values.cvv?.match(/^\d{3,4}$/)) {
        form.setError("cvv", { message: t("cvvInvalid") ?? "CVV invalide" });
        hasError = true;
      }
      if (hasError) return;
    } else {
      if (!values.mobileNumber?.match(/^\+?\d{8,15}$/)) {
        form.setError("mobileNumber", { message: t("mobileNumberInvalid") ?? "Numéro de téléphone mobile invalide" });
        return;
      }
    }
    onSubmit(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        
        {/* Sélecteur de méthode de paiement */}
        <div className="grid grid-cols-3 gap-2.5">
          {METHODS.map((method) => {
            const isSelected = paymentMethod === method.value;
            
            // Personnalisation des styles selon le type de paiement choisi
            let selectionBorder = "border-primary bg-primary/5";
            if (method.value === "MTN_MOBILE_MONEY") {
              selectionBorder = "border-amber-500 bg-amber-500/[0.07] dark:bg-amber-500/[0.12] text-amber-600 dark:text-amber-400";
            } else if (method.value === "ORANGE_MONEY") {
              selectionBorder = "border-orange-500 bg-orange-500/[0.07] dark:bg-orange-500/[0.12] text-orange-600 dark:text-orange-400";
            }

            return (
              <button
                key={method.value}
                type="button"
                onClick={() => form.setValue("paymentMethod", method.value)}
                className={cn(
                  "relative flex flex-col items-center gap-2 rounded-2xl border p-3.5 text-center transition-all duration-200 outline-none active:scale-95 shadow-2xs",
                  isSelected 
                    ? [selectionBorder, "ring-2 ring-current/10 font-bold"] 
                    : "border-border/60 hover:border-border hover:bg-slate-50/50 dark:hover:bg-zinc-900/30"
                )}
              >
                {/* Petite puce de sélection active */}
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 size-3.5 flex items-center justify-center rounded-full bg-current text-white">
                    <Check className="size-2 stroke-[4.5]" />
                  </div>
                )}

                {method.value === "CARD" ? (
                  <CreditCard className={cn("size-5", isSelected ? "text-primary" : "text-muted-foreground/80")} />
                ) : (
                  <Smartphone className={cn("size-5", isSelected ? "text-current" : "text-muted-foreground/80")} />
                )}
                
                <span className="text-[10px] sm:text-xs font-bold leading-tight select-none">
                  {t(method.labelKey) ?? (
                    method.value === "CARD" ? "Carte" : 
                    method.value === "MTN_MOBILE_MONEY" ? "MTN MoMo" : "Orange Money"
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* CONTENU MOBILE MONEY */}
        {isMobileMoney ? (
          <div className="p-4 rounded-2xl border border-border/50 bg-slate-50/20 dark:bg-zinc-900/10 space-y-4">
            <FormField
              control={form.control}
              name="mobileNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-muted-foreground/95">{t("mobileNumber") ?? "Numéro Mobile Money"}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                      <Input 
                        inputMode="tel" 
                        placeholder="+237 6xx xxx xxx" 
                        className="pl-9 rounded-xl border-border/80 bg-background focus-visible:ring-primary/20" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
              Une fois soumis, une demande de débit sera envoyée directement sur votre téléphone. Veuillez valider la transaction en saisissant votre code PIN secret sur votre carte SIM.
            </p>
          </div>
        ) : (
          /* CONTENU CARTE BANCAIRE */
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-muted-foreground/95">{t("cardNumber")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                      <Input 
                        inputMode="numeric" 
                        placeholder="4242 4242 4242 1234" 
                        className="pl-9 rounded-xl border-border/80 focus-visible:ring-primary/20" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="cardHolderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-muted-foreground/95">{t("cardHolderName")}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Jean Dupont" 
                      className="rounded-xl border-border/80 focus-visible:ring-primary/20" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expiry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-muted-foreground/95">{t("expiry")}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="MM/AA" 
                        className="rounded-xl border-border/80 focus-visible:ring-primary/20 text-center" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cvv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-muted-foreground/95">{t("cvv")}</FormLabel>
                    <FormControl>
                      <Input 
                        inputMode="numeric" 
                        maxLength={4}
                        placeholder="123" 
                        className="rounded-xl border-border/80 focus-visible:ring-primary/20 text-center" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Réassurance de sécurité */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/10 text-emerald-700 dark:text-emerald-400">
          <Lock className="size-4 shrink-0 mt-0.5" />
          <p className="text-xs font-medium leading-normal">
            {t("secureNotice") ?? "Vos données de paiement sont cryptées de bout en bout et traitées de manière totalement sécurisée."}
          </p>
        </div>

        {/* Bouton d'action */}
        <Button 
          type="submit" 
          size="lg" 
          className="w-full rounded-xl shadow-md font-bold tracking-wide gap-2 py-6 bg-primary hover:bg-primary/95 text-primary-foreground" 
          disabled={isSubmitting}
        >
          <ShieldCheck className="size-5 shrink-0" />
          {isSubmitting ? t("processing") : t("submit")}
        </Button>
      </form>
    </Form>
  );
}
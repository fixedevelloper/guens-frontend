// components/checkout/checkout-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Plus, Trash2, User, Mail, Phone, CreditCard, Calendar, ShieldCheck, Check } from "lucide-react";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CheckoutRequest, PassengerType } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const travelerSchema = z.object({
  fullName: z.string().trim().min(1, ""),
  dateOfBirth: z.string().optional(),
  passportNumber: z.string().optional(),
  type: z.enum(["ADULT", "CHILD", "INFANT"]),
  seatNumber: z.string().optional(),
});

const schema = z.object({
  contactEmail: z.string().trim().email(""),
  contactFullName: z.string().trim().min(1, ""),
  contactPhone: z.string().optional(),
  travelers: z.array(travelerSchema).min(1),
  paymentPlan: z.enum(["PAY_NOW", "PAY_LATER"]),
});

export type CheckoutFormValues = z.infer<typeof schema>;

interface CheckoutFormProps {
  selectedSeats?: string[];
  onSubmit: (request: Omit<CheckoutRequest, "offerId" | "offerType">) => void;
  isSubmitting: boolean;
}

export function CheckoutForm({ selectedSeats, onSubmit, isSubmitting }: CheckoutFormProps) {
  const t = useTranslations("Checkout");

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      contactEmail: "",
      contactFullName: "",
      contactPhone: "",
      travelers:
        selectedSeats && selectedSeats.length > 0
          ? selectedSeats.map((seatNumber) => ({
              fullName: "",
              dateOfBirth: "",
              passportNumber: "",
              type: "ADULT" as const,
              seatNumber,
            }))
          : [{ fullName: "", dateOfBirth: "", passportNumber: "", type: "ADULT" }],
      paymentPlan: "PAY_NOW",
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "travelers" });
  const paymentPlan = form.watch("paymentPlan");

  function handleSubmit(values: CheckoutFormValues) {
    onSubmit({
      contactEmail: values.contactEmail,
      contactFullName: values.contactFullName,
      contactPhone: values.contactPhone || undefined,
      travelers: values.travelers.map((traveler) => ({
        fullName: traveler.fullName,
        dateOfBirth: traveler.dateOfBirth || undefined,
        passportNumber: traveler.passportNumber || undefined,
        type: traveler.type,
        seatNumber: traveler.seatNumber || undefined,
      })),
      paymentPlan: values.paymentPlan,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        
        {/* SECTION 1 : COORDONNÉES DE CONTACT */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Mail className="size-4" />
            </div>
            <h3 className="text-base font-bold text-foreground">{t("contactSection")}</h3>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel className="text-xs font-bold text-muted-foreground/95">{t("contactEmail")}</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="nom@exemple.com" 
                      className="rounded-xl border-border/80 focus-visible:ring-primary/20" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactFullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-muted-foreground/95">{t("contactFullName")}</FormLabel>
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
            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-muted-foreground/95">{t("contactPhone")}</FormLabel>
                  <FormControl>
                    <Input 
                      type="tel" 
                      placeholder="+237 6xx xxx xxx" 
                      className="rounded-xl border-border/80 focus-visible:ring-primary/20" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator className="bg-border/40" />

        {/* SECTION 2 : VOYAGEURS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <User className="size-4" />
              </div>
              <h3 className="text-base font-bold text-foreground">{t("travelersSection")}</h3>
            </div>
            
            <Badge variant="secondary" className="rounded-full px-2.5 font-semibold text-[11px] border border-border/40">
              {fields.length} {fields.length > 1 ? "passagers" : "passager"}
            </Badge>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div 
                key={field.id} 
                className="group relative grid gap-4 p-4 sm:p-5 rounded-2xl border border-border/50 bg-slate-50/30 dark:bg-zinc-900/10 hover:border-border/80 transition-colors"
              >
                {/* Entête Voyageur */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground/90">
                      {t("traveler", { index: index + 1 })}
                    </span>
                    {field.seatNumber && (
                      <Badge variant="outline" className="rounded-md border-primary/25 bg-primary/5 text-primary text-[10px] font-bold px-1.5 py-0">
                        {t("seatBadge", { seat: field.seatNumber }) ?? `Siège ${field.seatNumber}`}
                      </Badge>
                    )}
                  </div>
                  
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      onClick={() => remove(index)}
                      aria-label={t("traveler", { index: index + 1 })}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>

                {/* Formulaire Voyageur */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`travelers.${index}.fullName`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-muted-foreground/90">{t("fullName")}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Nom complet (tel que sur le passeport)" 
                            className="rounded-xl border-border/80 bg-background focus-visible:ring-primary/20" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`travelers.${index}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-muted-foreground/90">{t("passengerType")}</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(v) => field.onChange(v as PassengerType)}
                        >
                          <FormControl>
                            <SelectTrigger className="rounded-xl border-border/80 bg-background focus:ring-primary/20">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="ADULT">{t("adult")}</SelectItem>
                            <SelectItem value="CHILD">{t("child")}</SelectItem>
                            <SelectItem value="INFANT">{t("infant")}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`travelers.${index}.dateOfBirth`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-muted-foreground/90">{t("dateOfBirth")}</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            className="rounded-xl border-border/80 bg-background focus-visible:ring-primary/20" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`travelers.${index}.passportNumber`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-muted-foreground/90">{t("passportNumber")}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="N° de document" 
                            className="rounded-xl border-border/80 bg-background focus-visible:ring-primary/20 text-uppercase" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}

            {/* Bouton pour ajouter un voyageur */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-1 gap-1.5 rounded-full border-dashed border-border/80 hover:border-primary/40 hover:bg-primary/5 text-xs px-4"
              onClick={() => append({ fullName: "", dateOfBirth: "", passportNumber: "", type: "ADULT" })}
            >
              <Plus className="size-3.5" />
              Ajouter un voyageur
            </Button>
          </div>
        </div>

        <Separator className="bg-border/40" />

        {/* SECTION 3 : OPTIONS DE PAIEMENT */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <CreditCard className="size-4" />
            </div>
            <h3 className="text-base font-bold text-foreground">{t("paymentPlanSection")}</h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {(["PAY_NOW", "PAY_LATER"] as const).map((value) => {
              const isActive = paymentPlan === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => form.setValue("paymentPlan", value)}
                  className={cn(
                    "relative flex items-start gap-3 rounded-2xl border p-4 text-left transition-all outline-none duration-200 active:scale-98 shadow-2xs",
                    isActive 
                      ? "border-primary bg-primary/5 ring-2 ring-primary/10" 
                      : "border-border/60 hover:border-border hover:bg-slate-50/50 dark:hover:bg-zinc-900/30"
                  )}
                >
                  <div className={cn(
                    "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border text-white transition-colors",
                    isActive ? "border-primary bg-primary" : "border-muted-foreground/45 bg-transparent"
                  )}>
                    {isActive && <Check className="size-2.5 stroke-[3]" />}
                  </div>

                  <div className="grid gap-1">
                    <span className="text-sm font-bold text-foreground">
                      {value === "PAY_NOW" ? t("payNow") : t("payLater")}
                    </span>
                    <span className="text-xs text-muted-foreground leading-normal pr-1">
                      {value === "PAY_NOW"
                        ? t("payNowDescription")
                        : t("payLaterDescription")}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* NOTICE & SOUMISSION */}
        <div className="space-y-4 pt-4 border-t border-border/40">
          <p className="text-xs text-muted-foreground/80 leading-relaxed bg-slate-50 dark:bg-zinc-900/40 p-3.5 rounded-xl border border-border/30">
            {t("guestNotice") ?? "En soumettant cette demande, vous confirmez que les informations ci-dessus correspondent exactement à vos pièces d'identité officielles de voyage."}
          </p>

          <Button 
            type="submit" 
            size="lg" 
            className="w-full rounded-xl shadow-md font-bold tracking-wide gap-2 bg-primary hover:bg-primary/95 text-primary-foreground py-6" 
            disabled={isSubmitting}
          >
            <ShieldCheck className="size-5 shrink-0" />
            {isSubmitting ? t("submitting") : t("submit")}
          </Button>
        </div>

      </form>
    </Form>
  );
}
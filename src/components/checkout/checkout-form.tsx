"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Plus, Trash2, User, Mail, CreditCard, ShieldCheck, Check } from "lucide-react";
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
import { CountrySelect } from "@/components/checkout/country-select";
import { PassportValidityAlert } from "@/components/checkout/passport-validity-alert";
import type { CheckoutRequest, PassengerType } from "@/lib/api/types";
import { createPassportExpirySchema } from "@/lib/passport-validity";
import { cn } from "@/lib/utils";

// Vols uniquement : Travelopro (et les GDS en général) exigent date de naissance et nationalité
// pour chaque passager - confirmé par des tests réels ("PassengerNationality details is required
// for this airline"). Optionnel pour les autres types d'offre (hôtel/véhicule/logement), qui n'en
// ont pas besoin.
//
// passportExpiryDate reste optionnel (certaines routes ne demandent pas de passeport), mais s'il
// est renseigné il doit couvrir la règle des 6 mois après la date du voyage (voir
// lib/passport-validity.ts) - un simple ">= date du voyage" ne suffisait pas : un vrai rejet
// Travel Terminus au moment de l'émission du billet ("Passport for passenger1 will be expired
// before travel date"), qui n'apparaissait sinon qu'après capture du paiement, a montré que même
// cette version faible manquait ici - et la plupart des destinations exigent en réalité 6 mois de
// marge, pas juste "pas encore expiré ce jour-là".
const travelerSchema = (isFlight: boolean, travelDate?: string) => z.object({
  fullName: z.string().trim().min(1, "Le nom du voyageur est requis"),
  dateOfBirth: isFlight
    ? z.string().trim().min(1, "La date de naissance est requise")
    : z.string().optional(),
  passportNumber: z.string().optional(),
  type: z.enum(["ADULT", "CHILD", "INFANT"]),
  seatNumber: z.string().optional(),
  nationality: isFlight
    ? z.string().trim().min(1, "La nationalité est requise")
    : z.string().optional(),
  passportIssueCountry: z.string().optional(),
  passportExpiryDate: isFlight && travelDate
    ? z.union([z.literal(""), createPassportExpirySchema(travelDate)]).optional()
    : z.string().optional(),
  // Optional client-side like the other passport fields (not every route needs a passport), but
  // TravelTerminus's real Book API rejects a passenger whose passport info is submitted without
  // it - a real booking failed this way ("passengers.0.document.issuing_date_required") after
  // payment had already been captured, which is a much worse place to catch this than here.
  passportIssueDate: z.string().optional(),
});

const buildSchema = (isFlight: boolean, travelDate?: string) => z.object({
  contactEmail: z.string().trim()
    .min(1, "L'email de contact est requis")
    .email("Format d'email invalide"),
  contactFullName: z.string().trim().min(1, "Le nom du contact est requis"),
  contactPhone: z.string().optional(),
  travelers: z.array(travelerSchema(isFlight, travelDate)).min(1, "Au moins un voyageur est requis"),
  paymentPlan: z.enum(["PAY_NOW", "PAY_LATER"]),
});

export type CheckoutFormValues = z.infer<ReturnType<typeof buildSchema>>;
export type PaymentPlanValue = "PAY_NOW" | "PAY_LATER";

interface CheckoutFormProps {
  /** Nombre de voyageurs à préremplir dans le formulaire (défaut 1) - vient du sélecteur de
   *  l'étape Options pour un vol, absent pour les autres types d'offre. */
  travelerCount?: number;
  /** Code du siège réel choisi (ex. "1A") pour chaque voyageur, même index que travelerCount -
   *  peut avoir des trous (voyageur sans siège choisi). */
  seatLabelsByTraveler?: (string | undefined)[];
  onSubmit: (request: Omit<CheckoutRequest, "offerId" | "offerType">) => void;
  isSubmitting: boolean;
  /** Remonte le choix PAY_NOW/PAY_LATER au parent, pour que OfferSummaryCard puisse afficher le bon montant. */
  onPaymentPlanChange?: (plan: PaymentPlanValue) => void;
  /** Rend date de naissance et nationalité obligatoires par voyageur - requis par les fournisseurs de vols. */
  isFlight?: boolean;
  /** Date du voyage (ISO), utilisée pour vérifier que le passeport ne sera pas expiré. */
  travelDate?: string;
}

export function CheckoutForm({
                                travelerCount = 1,
                                seatLabelsByTraveler,
                                onSubmit,
                                isSubmitting,
                                onPaymentPlanChange,
                                isFlight = false,
                                travelDate,
                              }: CheckoutFormProps) {
  const t = useTranslations("Checkout");

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(buildSchema(isFlight, travelDate)),
    defaultValues: {
      contactEmail: "",
      contactFullName: "",
      contactPhone: "",
      travelers: Array.from({ length: Math.max(1, travelerCount) }, (_, i) => ({
        fullName: "",
        dateOfBirth: "",
        passportNumber: "",
        type: "ADULT" as const,
        seatNumber: seatLabelsByTraveler?.[i] ?? "",
        nationality: "",
        passportIssueCountry: "",
        passportExpiryDate: "",
        passportIssueDate: "",
      })),
      paymentPlan: "PAY_NOW",
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "travelers" });
  const paymentPlan = form.watch("paymentPlan");

  // Synchronise le parent dès le montage (valeur par défaut) et à chaque changement de choix.
  useEffect(() => {
    onPaymentPlanChange?.(paymentPlan);
  }, [paymentPlan, onPaymentPlanChange]);

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
        nationality: traveler.nationality || undefined,
        passportIssueCountry: traveler.passportIssueCountry || undefined,
        passportExpiryDate: traveler.passportExpiryDate || undefined,
        passportIssueDate: traveler.passportIssueDate || undefined,
      })),
      paymentPlan: values.paymentPlan,
    });
  }

  return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 sm:space-y-8">

          {/* SECTION 1 : COORDONNÉES DE CONTACT */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                <Mail className="size-4" />
              </div>
              <h3 className="text-base font-bold text-foreground">{t("contactSection")}</h3>
            </div>

            <div className="grid gap-3.5 sm:gap-4 grid-cols-1 sm:grid-cols-2">
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
                              className="h-11 sm:h-10 rounded-xl border-border/80 focus-visible:ring-primary/20 text-sm"
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
                      <FormItem className="col-span-1">
                        <FormLabel className="text-xs font-bold text-muted-foreground/95">{t("contactFullName")}</FormLabel>
                        <FormControl>
                          <Input
                              placeholder="Jean Dupont"
                              className="h-11 sm:h-10 rounded-xl border-border/80 focus-visible:ring-primary/20 text-sm"
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
                      <FormItem className="col-span-1">
                        <FormLabel className="text-xs font-bold text-muted-foreground/95">{t("contactPhone")}</FormLabel>
                        <FormControl>
                          <Input
                              type="tel"
                              placeholder="+237 6xx xxx xxx"
                              className="h-11 sm:h-10 rounded-xl border-border/80 focus-visible:ring-primary/20 text-sm"
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
            <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
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
                      className="group relative grid gap-4 p-3.5 sm:p-5 rounded-2xl border border-border/50 bg-slate-50/30 dark:bg-zinc-900/10 hover:border-border/80 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-wrap">
                    <span className="text-sm font-bold text-foreground/90 whitespace-nowrap">
                      {t("traveler", { index: index + 1 })}
                    </span>
                        {field.seatNumber && (
                            <Badge variant="outline" className="rounded-md border-primary/25 bg-primary/5 text-primary text-[10px] font-bold px-1.5 py-0 whitespace-nowrap">
                              {t("seatBadge", { seat: field.seatNumber }) ?? `Siège ${field.seatNumber}`}
                            </Badge>
                        )}
                      </div>

                      {fields.length > 1 && (
                          <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                              onClick={() => remove(index)}
                              aria-label={t("traveler", { index: index + 1 })}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                      )}
                    </div>

                    <div className="grid gap-3.5 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                      <FormField
                          control={form.control}
                          name={`travelers.${index}.fullName`}
                          render={({ field }) => (
                              <FormItem className="sm:col-span-2">
                                <FormLabel className="text-xs font-bold text-muted-foreground/90">{t("fullName")}</FormLabel>
                                <FormControl>
                                  <Input
                                      placeholder="Nom complet (tel que sur le passeport)"
                                      className="h-11 sm:h-10 rounded-xl border-border/80 bg-background focus-visible:ring-primary/20 text-sm"
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
                              <FormItem className="col-span-1">
                                <FormLabel className="text-xs font-bold text-muted-foreground/90">{t("passengerType")}</FormLabel>
                                <Select
                                    value={field.value}
                                    onValueChange={(v) => field.onChange(v as PassengerType)}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-11 sm:h-10 rounded-xl border-border/80 bg-background focus:ring-primary/20 text-sm">
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
                              <FormItem className="col-span-1">
                                <FormLabel className="text-xs font-bold text-muted-foreground/90">{t("dateOfBirth")}</FormLabel>
                                <FormControl>
                                  <Input
                                      type="date"
                                      className="h-11 sm:h-10 rounded-xl border-border/80 bg-background focus-visible:ring-primary/20 text-sm"
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
                              <FormItem className="col-span-1">
                                <FormLabel className="text-xs font-bold text-muted-foreground/90">{t("passportNumber")}</FormLabel>
                                <FormControl>
                                  <Input
                                      placeholder="N° de document"
                                      className="h-11 sm:h-10 rounded-xl border-border/80 bg-background focus-visible:ring-primary/20 text-sm uppercase"
                                      {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                          )}
                      />

                      <FormField
                          control={form.control}
                          name={`travelers.${index}.nationality`}
                          render={({ field }) => (
                              <FormItem className="col-span-1">
                                <FormLabel className="text-xs font-bold text-muted-foreground/90">{t("nationality")}</FormLabel>
                                <FormControl>
                                  <CountrySelect
                                      value={field.value || undefined}
                                      onChange={(iso2) => field.onChange(iso2)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                          )}
                      />

                      <FormField
                          control={form.control}
                          name={`travelers.${index}.passportIssueCountry`}
                          render={({ field }) => (
                              <FormItem className="col-span-1">
                                <FormLabel className="text-xs font-bold text-muted-foreground/90">{t("passportIssueCountry")}</FormLabel>
                                <FormControl>
                                  <CountrySelect
                                      value={field.value || undefined}
                                      onChange={(iso2) => field.onChange(iso2)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                          )}
                      />

                      <FormField
                          control={form.control}
                          name={`travelers.${index}.passportIssueDate`}
                          render={({ field }) => (
                              <FormItem className="col-span-1">
                                <FormLabel className="text-xs font-bold text-muted-foreground/90">{t("passportIssueDate")}</FormLabel>
                                <FormControl>
                                  <Input
                                      type="date"
                                      className="h-11 sm:h-10 rounded-xl border-border/80 bg-background focus-visible:ring-primary/20 text-sm"
                                      {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                          )}
                      />

                      <FormField
                          control={form.control}
                          name={`travelers.${index}.passportExpiryDate`}
                          render={({ field }) => (
                              <FormItem className="col-span-1">
                                <FormLabel className="text-xs font-bold text-muted-foreground/90">{t("passportExpiryDate")}</FormLabel>
                                <FormControl>
                                  <Input
                                      type="date"
                                      className="h-11 sm:h-10 rounded-xl border-border/80 bg-background focus-visible:ring-primary/20 text-sm"
                                      {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                          )}
                      />

                      {/* Retour immédiat (avant soumission) sur la règle des 6 mois - le
                          FormMessage ci-dessus ne s'affiche qu'après une tentative de soumission
                          ou un blur, ce qui laisse un passeport insuffisant sans aucun signal
                          pendant que le voyageur le renseigne. */}
                      {isFlight && travelDate && (
                          <PassportValidityAlert
                              className="col-span-1 sm:col-span-2"
                              passportExpiryDate={form.watch(`travelers.${index}.passportExpiryDate`)}
                              flightDate={travelDate}
                          />
                      )}
                    </div>
                  </div>
              ))}

              <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto justify-center h-11 sm:h-9 mt-1 gap-1.5 rounded-xl sm:rounded-full border-dashed border-border/80 hover:border-primary/40 hover:bg-primary/5 text-xs px-4"
                  onClick={() => append({
                    fullName: "", dateOfBirth: "", passportNumber: "", type: "ADULT",
                    nationality: "", passportIssueCountry: "", passportExpiryDate: "", passportIssueDate: "",
                  })}
              >
                <Plus className="size-4 sm:size-3.5" />
                Ajouter un voyageur
              </Button>
            </div>
          </div>

          <Separator className="bg-border/40" />

          {/* SECTION 3 : OPTIONS DE PAIEMENT */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                <CreditCard className="size-4" />
              </div>
              <h3 className="text-base font-bold text-foreground">{t("paymentPlanSection")}</h3>
            </div>

            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              {(["PAY_NOW", "PAY_LATER"] as const).map((value) => {
                const isActive = paymentPlan === value;
                // PAY_LATER (deposit-now/pay-balance-later) is disabled for now - kept in the UI,
                // greyed out, rather than removed, so it can be re-enabled later without redoing
                // this section.
                const isDisabled = value === "PAY_LATER";
                return (
                    <button
                        key={value}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => !isDisabled && form.setValue("paymentPlan", value)}
                        className={cn(
                            "relative flex items-start gap-3 rounded-2xl border p-3.5 sm:p-4 text-left transition-all outline-none duration-200 active:scale-[0.98] shadow-2xs w-full",
                            isDisabled
                                ? "cursor-not-allowed opacity-50 border-border/40"
                                : isActive
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

                      <div className="grid gap-1 min-w-0 flex-1">
                    <span className="text-sm font-bold text-foreground leading-snug">
                      {value === "PAY_NOW" ? t("payNow") : t("payLater")}
                    </span>
                        <span className="text-xs text-muted-foreground leading-relaxed">
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

          <div className="space-y-4 pt-4 border-t border-border/40">
            <p className="text-xs text-muted-foreground/80 leading-relaxed bg-slate-50 dark:bg-zinc-900/40 p-3.5 rounded-xl border border-border/30">
              {t("guestNotice") ?? "En soumettant cette demande, vous confirmez que les informations ci-dessus correspondent exactement à vos pièces d'identité officielles de voyage."}
            </p>

            <Button
                type="submit"
                size="lg"
                className="w-full rounded-xl shadow-md font-bold tracking-wide gap-2 bg-primary hover:bg-primary/95 text-primary-foreground h-12 sm:h-14 text-sm sm:text-base"
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
"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Building2,
  CheckCircle2,
  CreditCard,
  Smartphone,
  Upload,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Store,
  BadgeCheck,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCreateResellerMutation } from "@/hooks/use-rellers-queries";
import { useAuth } from "@/context/auth-context";

// Import de votre hook personnalisé

interface ResellerFormData {
  companyName: string;
  registrationNumber: string;
  contactName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  description: string;
  logo: File | null;
}

export default function BecomeResellerPage() {
  const t = useTranslations("Reseller");
  const { mutateAsync: createReseller, isPending, error } = useCreateResellerMutation();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "om" | "card">("om");
  const [paymentPhone, setPaymentPhone] = useState("");
const { user } = useAuth();

const [formData, setFormData] = useState<ResellerFormData>({
  userId: user?.id ?? "",
  companyName: "",
  registrationNumber: "",
  contactName: user?.name ?? "", // Pré-remplissage UX ergonomique
  email: user?.email ?? "",       // Pré-remplissage UX
  phone: user?.phone ?? "",
  city: "",
  country: "",
  description: "",
  logo: null,
});

// Synchronisation si 'user' est chargé de manière asynchrone après le premier rendu
useEffect(() => {
  if (user?.id) {
    setFormData((prev) => ({
      ...prev,
      userId: user.id,
      contactName: prev.contactName || user.name || "",
      email: prev.email || user.email || "",
    }));
  }
}, [user]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, logo: file }));
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const removeLogo = () => {
    setFormData((prev) => ({ ...prev, logo: null }));
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(null);
  };

  const handleNextStep = (e: FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleProcessPayment = async (e: FormEvent) => {
    e.preventDefault();

    try {
      // Exécution de la mutation TanStack Query
      await createReseller(formData);
      
      // Pass à l'étape finale en cas de succès
      setStep(3);
    } catch (err) {
      console.error("Erreur lors de la création du revendeur :", err);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      {/* EN-TÊTE PRINCIPALE */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <Badge
          variant="secondary"
          className="rounded-full px-3 py-1 text-xs font-extrabold gap-1.5 bg-primary/10 text-primary border border-primary/20"
        >
          <Sparkles className="size-3.5 fill-primary" />
          {t("badge")}
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="text-sm font-medium text-muted-foreground leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      {/* BARRE DE PROGRESSION DES ÉTAPES */}
      <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
        <div className="flex items-center gap-2">
          <div
            className={`size-8 rounded-full flex items-center justify-center font-extrabold text-xs transition-colors ${
              step >= 1 ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted text-muted-foreground"
            }`}
          >
            1
          </div>
          <span className={`text-xs font-bold ${step >= 1 ? "text-foreground" : "text-muted-foreground"}`}>
            {t("steps.info")}
          </span>
        </div>

        <div className={`h-0.5 w-12 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-border"}`} />

        <div className="flex items-center gap-2">
          <div
            className={`size-8 rounded-full flex items-center justify-center font-extrabold text-xs transition-colors ${
              step >= 2 ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted text-muted-foreground"
            }`}
          >
            2
          </div>
          <span className={`text-xs font-bold ${step >= 2 ? "text-foreground" : "text-muted-foreground"}`}>
            {t("steps.payment")}
          </span>
        </div>
      </div>

      {/* ÉTAPE 1 : FORMULAIRE PRO / ENTREPRISE */}
      {step === 1 && (
        <Card className="rounded-3xl border border-border/60 bg-card shadow-xs">
          <CardHeader className="border-b border-border/40 pb-5">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Building2 className="size-5 text-primary" />
              {t("form.profileTitle")}
            </CardTitle>
            <CardDescription className="text-xs font-medium">
              {t("form.profileDesc")}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleNextStep} className="space-y-6">
              {/* LOGO UPLOAD */}
              <div className="space-y-2">
                <Label className="text-xs font-bold">{t("form.logoLabel")}</Label>
                <div className="flex items-center gap-4">
                  {logoPreview ? (
                    <div className="relative size-20 rounded-2xl border border-border bg-muted/30 p-1 flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logoPreview} alt="Preview" className="max-h-full max-w-full object-contain" />
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:opacity-90"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border/80 rounded-2xl cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors">
                      <div className="flex flex-col items-center justify-center text-center p-4">
                        <Upload className="size-6 text-primary mb-1" />
                        <p className="text-xs font-bold text-foreground">{t("form.logoUpload")}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">{t("form.logoHint")}</p>
                      </div>
                      <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* CHAMPS DE FORMULAIRE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-xs font-bold">
                    {t("form.companyName")} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    required
                    placeholder={t("form.companyNamePlaceholder")}
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="rounded-xl h-10 text-xs font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationNumber" className="text-xs font-bold">
                    {t("form.registrationNumber")} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="registrationNumber"
                    name="registrationNumber"
                    required
                    placeholder={t("form.registrationNumberPlaceholder")}
                    value={formData.registrationNumber}
                    onChange={handleInputChange}
                    className="rounded-xl h-10 text-xs font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactName" className="text-xs font-bold">
                    {t("form.contactName")} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contactName"
                    name="contactName"
                    required
                    placeholder={t("form.contactNamePlaceholder")}
                    value={formData.contactName}
                    onChange={handleInputChange}
                    className="rounded-xl h-10 text-xs font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold">
                    {t("form.email")} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    required
                    placeholder={t("form.emailPlaceholder")}
                    value={formData.email}
                    onChange={handleInputChange}
                    className="rounded-xl h-10 text-xs font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-bold">
                    {t("form.phone")} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    required
                    placeholder={t("form.phonePlaceholder")}
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="rounded-xl h-10 text-xs font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-xs font-bold">
                    {t("form.city")} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    required
                    placeholder={t("form.cityPlaceholder")}
                    value={formData.city}
                    onChange={handleInputChange}
                    className="rounded-xl h-10 text-xs font-medium"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="country" className="text-xs font-bold">
                    {t("form.country")} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="country"
                    name="country"
                    required
                    placeholder={t("form.countryPlaceholder")}
                    value={formData.country}
                    onChange={handleInputChange}
                    className="rounded-xl h-10 text-xs font-medium"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="description" className="text-xs font-bold">
                    {t("form.description")}
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    rows={3}
                    placeholder={t("form.descriptionPlaceholder")}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="rounded-xl text-xs font-medium resize-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" size="lg" className="rounded-2xl font-bold text-xs gap-2 px-6">
                  <span>{t("form.continueBtn")}</span>
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ÉTAPE 2 : ADHÉSION & PAIEMENT */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* RÉSUMÉ DES AVANTAGES & TARIF */}
          <Card className="rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/5 via-card to-card shadow-xs lg:col-span-1">
            <CardHeader className="border-b border-border/40 pb-4">
              <Badge className="w-fit rounded-lg bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-black">
                {t("payment.badge")}
              </Badge>
              <CardTitle className="text-2xl font-black text-foreground pt-1">
                {t("payment.price")}
              </CardTitle>
              <CardDescription className="text-xs font-medium">
                {t("payment.priceDesc")}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              <p className="text-xs font-extrabold text-foreground">{t("payment.includedTitle")}</p>
              <ul className="space-y-2.5 text-xs text-muted-foreground font-medium">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{t("payment.benefits.dashboard")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{t("payment.benefits.commissions")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{t("payment.benefits.wallet")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{t("payment.benefits.support")}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* SÉLECTION METHODE PAIEMENT */}
          <Card className="rounded-3xl border border-border/60 bg-card shadow-xs lg:col-span-2">
            <CardHeader className="border-b border-border/40 pb-5">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <CreditCard className="size-5 text-primary" />
                {t("payment.methodTitle")}
              </CardTitle>
              <CardDescription className="text-xs font-medium">
                {t("payment.methodDesc")}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleProcessPayment} className="space-y-6">
                {/* ALERTE D'ERREUR */}
                {error && (
                  <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>Une erreur est survenue lors de votre inscription. Veuillez réessayer.</span>
                  </div>
                )}

                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(val) => setPaymentMethod(val as "momo" | "om" | "card")}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                >
                  <label
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === "om"
                        ? "border-primary bg-primary/5"
                        : "border-border/60 hover:bg-muted/30"
                    }`}
                  >
                    <RadioGroupItem value="om" className="sr-only" />
                    <Smartphone className="size-6 text-orange-500 mb-2" />
                    <span className="text-xs font-extrabold text-foreground">{t("payment.orangeMoney")}</span>
                    <span className="text-[10px] text-muted-foreground font-medium">{t("payment.orangeMoneySub")}</span>
                  </label>

                  <label
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === "momo"
                        ? "border-primary bg-primary/5"
                        : "border-border/60 hover:bg-muted/30"
                    }`}
                  >
                    <RadioGroupItem value="momo" className="sr-only" />
                    <Smartphone className="size-6 text-amber-500 mb-2" />
                    <span className="text-xs font-extrabold text-foreground">{t("payment.mtnMomo")}</span>
                    <span className="text-[10px] text-muted-foreground font-medium">{t("payment.mtnMomoSub")}</span>
                  </label>

                  <label
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === "card"
                        ? "border-primary bg-primary/5"
                        : "border-border/60 hover:bg-muted/30"
                    }`}
                  >
                    <RadioGroupItem value="card" className="sr-only" />
                    <CreditCard className="size-6 text-primary mb-2" />
                    <span className="text-xs font-extrabold text-foreground">{t("payment.creditCard")}</span>
                    <span className="text-[10px] text-muted-foreground font-medium">{t("payment.creditCardSub")}</span>
                  </label>
                </RadioGroup>

                {paymentMethod !== "card" ? (
                  <div className="space-y-2 p-4 rounded-2xl bg-muted/30 border border-border/40">
                    <Label htmlFor="paymentPhone" className="text-xs font-bold">
                      {t("payment.phoneLabel", { provider: paymentMethod === "om" ? "Orange" : "MTN" })}
                    </Label>
                    <Input
                      id="paymentPhone"
                      required
                      type="tel"
                      placeholder={t("payment.phonePlaceholder")}
                      value={paymentPhone}
                      onChange={(e) => setPaymentPhone(e.target.value)}
                      className="rounded-xl h-10 text-xs font-medium bg-background"
                    />
                    <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1 pt-1">
                      <AlertCircle className="size-3.5 text-amber-500 shrink-0" />
                      {t("payment.ussdNotice")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 p-4 rounded-2xl bg-muted/30 border border-border/40">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">{t("payment.cardNumber")}</Label>
                      <Input placeholder="4000 1234 5678 9010" className="rounded-xl h-10 text-xs bg-background" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold">{t("payment.expiryDate")}</Label>
                        <Input placeholder="MM/YY" className="rounded-xl h-10 text-xs bg-background" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold">{t("payment.cvc")}</Label>
                        <Input placeholder="123" className="rounded-xl h-10 text-xs bg-background" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => setStep(1)}
                    className="rounded-2xl font-bold text-xs gap-2"
                  >
                    <ArrowLeft className="size-4" />
                    <span>{t("payment.backBtn")}</span>
                  </Button>

                  <Button
                    type="submit"
                    disabled={isPending}
                    className="rounded-2xl font-bold text-xs gap-2 px-6 shadow-xs"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>{t("payment.processing")}</span>
                      </>
                    ) : (
                      <>
                        <span>{t("payment.payBtn")}</span>
                        <ShieldCheck className="size-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ÉTAPE 3 : CONFIRMATION & SUCCÈS */}
      {step === 3 && (
        <Card className="rounded-3xl border border-emerald-500/20 bg-card p-8 text-center space-y-5 shadow-xs max-w-xl mx-auto">
          <div className="size-16 rounded-3xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-500/20">
            <BadgeCheck className="size-9" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-foreground">{t("success.title")}</h2>
            <p className="text-xs font-medium text-muted-foreground leading-relaxed">
              {t("success.description", { companyName: formData.companyName })}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-muted/30 text-left space-y-1.5 text-xs">
            <p className="font-bold text-foreground">{t("success.summaryTitle")}</p>
            <p className="text-muted-foreground">
              {t("success.company")} <span className="font-semibold text-foreground">{formData.companyName}</span>
            </p>
            <p className="text-muted-foreground">
              {t("success.contact")} <span className="font-semibold text-foreground">{formData.contactName} ({formData.email})</span>
            </p>
          </div>

          <Button asChild size="lg" className="rounded-2xl font-bold text-xs w-full">
            <a href="/dashboard">
              <Store className="size-4 mr-2" />
              {t("success.dashboardBtn")}
            </a>
          </Button>
        </Card>
      )}
    </div>
  );
}
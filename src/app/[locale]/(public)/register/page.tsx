"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { UserPlus, Loader2, Sparkles, Compass, CheckCircle2 } from "lucide-react";
import { z } from "zod";

import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/context/auth-context";
import { normalizeApiError } from "@/lib/api/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const schema = z.object({
  fullName: z.string().trim().min(1, ""),
  email: z.string().trim().email(""),
  phone: z.string().optional(),
  password: z.string().min(8, ""),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const t = useTranslations("Auth");
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", phone: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    setError(null);
    try {
      const profile = await registerUser({ ...values, phone: values.phone || undefined });
      router.push(profile.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(normalizeApiError(err).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-12 w-full">
      
      {/* COLONNE GAUCHE : VISUEL IMMERSIF (Masqué sur mobile) */}
      <div className="relative hidden lg:flex lg:col-span-5 xl:col-span-6 flex-col justify-between p-12 text-white overflow-hidden"
        style={{
          background: `linear-gradient(135deg, hsl(210 55% 40%), hsl(240 55% 24%))`,
        }}
      >
        {/* Texture fine de grille en arrière-plan */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />
        <div className="absolute top-1/4 -right-20 size-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -left-10 size-64 rounded-full bg-black/20 blur-2xl pointer-events-none" />

        {/* LOGO OU BRANDING */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 shadow-xs">
            <Compass className="size-5 text-white animate-pulse duration-3000" />
          </div>
          <span className="font-black text-sm tracking-widest uppercase">Guen's Union</span>
        </div>

        {/* CONTENU TEXTUEL CENTRAL */}
        <div className="relative z-10 space-y-5 max-w-md">
          <h2 className="text-3xl xl:text-4xl font-black tracking-tight leading-tight">
            Créez votre compte en quelques instants.
          </h2>
          <p className="text-sm text-white/80 leading-relaxed font-medium">
            Rejoignez-nous pour débloquer des tarifs négociés auprès des plus grands prestataires, gérer vos réservations facilement et suivre vos itinéraires de voyage.
          </p>
          
          <ul className="space-y-2.5 pt-4 text-xs font-semibold text-white/90">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
              Accès gratuit et instantané aux offres
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
              Comparateur multi-fournisseurs temps réel
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
              Support dédié et suivi de vos dossiers
            </li>
          </ul>
        </div>

        {/* PIED DE PAGE */}
        <div className="relative z-10 pt-6 border-t border-white/10">
          <p className="text-xs text-white/60 font-semibold">
            © 2026 Guen's Union. Tous droits réservés.
          </p>
        </div>
      </div>

      {/* COLONNE DROITE : FORMULAIRE D'INSCRIPTION */}
      <div className="lg:col-span-7 xl:col-span-6 flex items-center justify-center p-6 sm:p-12 md:p-16 bg-background">
        <div className="w-full max-w-[390px] space-y-8">
          
          {/* EN-TÊTE ÉPURÉ */}
          <div className="space-y-2">
            <div className="lg:hidden flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
              <Compass className="size-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              {t("registerTitle") ?? "Créer un compte"}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground/80 font-medium">
              Rejoignez notre plateforme pour planifier vos voyages.
            </p>
          </div>

          {error && (
            <Alert className="rounded-xl border-destructive/20 bg-destructive/5 text-destructive py-3">
              <AlertDescription className="text-xs font-semibold leading-relaxed">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              {/* CHAMP : NOM COMPLET */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-bold text-muted-foreground/90 tracking-wide uppercase">
                      {t("fullName") ?? "Nom complet"}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="John Doe"
                        autoComplete="name" 
                        className="rounded-xl border-border/70 h-10 text-sm font-medium focus-visible:ring-primary/20 placeholder:text-muted-foreground/45 transition-all"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-[11px] font-bold text-destructive" />
                  </FormItem>
                )}
              />

              {/* CHAMP : ADRESSE EMAIL */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-bold text-muted-foreground/90 tracking-wide uppercase">
                      {t("email") ?? "Adresse e-mail"}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        autoComplete="email" 
                        placeholder="votre@adresse.com"
                        className="rounded-xl border-border/70 h-10 text-sm font-medium focus-visible:ring-primary/20 placeholder:text-muted-foreground/45 transition-all"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-[11px] font-bold text-destructive" />
                  </FormItem>
                )}
              />

              {/* CHAMP : TÉLÉPHONE */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-bold text-muted-foreground/90 tracking-wide uppercase">
                      {t("phone") ?? "Téléphone"} <span className="text-[10px] text-muted-foreground/60">(Optionnel)</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="tel" 
                        autoComplete="tel" 
                        placeholder="+237 6xx xxx xxx"
                        className="rounded-xl border-border/70 h-10 text-sm font-medium focus-visible:ring-primary/20 placeholder:text-muted-foreground/45 transition-all"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-[11px] font-bold text-destructive" />
                  </FormItem>
                )}
              />

              {/* CHAMP : MOT DE PASSE */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-bold text-muted-foreground/90 tracking-wide uppercase">
                      {t("password") ?? "Mot de passe"}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        autoComplete="new-password" 
                        placeholder="•••••••• (8 caractères min.)"
                        className="rounded-xl border-border/70 h-10 text-sm font-medium focus-visible:ring-primary/20 placeholder:text-muted-foreground/45 transition-all"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-[11px] font-bold text-destructive" />
                  </FormItem>
                )}
              />

              {/* BOUTON DE SOUMISSION */}
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full rounded-xl font-bold text-xs gap-1.5 h-10.5 py-4 shadow-2xs transition-all active:scale-98 mt-4"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin shrink-0" />
                    Création du compte...
                  </>
                ) : (
                  <>
                    <UserPlus className="size-3.5 stroke-[2.2]" />
                    {t("registerSubmit") ?? "Créer un compte"}
                  </>
                )}
              </Button>
            </form>
          </Form>

          {/* LIEN DE CONNEXION */}
          <div className="text-center text-xs sm:text-sm text-muted-foreground/90 font-medium pt-2">
            {t("hasAccount") ?? "Vous avez déjà un compte ?"}{" "}
            <Link 
              href="/login" 
              className="font-bold text-primary underline-offset-4 hover:underline transition-all"
            >
              {t("switchToLogin") ?? "Se connecter"}
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { LogIn, Loader2, Sparkles, Compass, ShieldCheck, MapPin } from "lucide-react";
import { z } from "zod";

import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/context/auth-context";
import { normalizeApiError } from "@/lib/api/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const schema = z.object({
  email: z.string().trim().email(""),
  password: z.string().min(1, ""),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const t = useTranslations("Auth");
  const { login } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const PARTNER_ROLES = [
    "PARTNER_AIRLINE",
    "PARTNER_HOTEL",
    "PARTNER_CAR_RENTAL",
    "PARTNER_FURNISHED_RENTAL",
  ] as const;

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    setError(null);
    try {
      const profile = await login(values);

      if (profile.role === "ADMIN") {
        router.push("/admin");
      } else if (PARTNER_ROLES.includes(profile.role as (typeof PARTNER_ROLES)[number])) {
        router.push("/partner");
      } else {
        router.push("/dashboard");
      }
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
        <div className="relative z-10 space-y-4 max-w-md">
          <h2 className="text-3xl xl:text-4xl font-black tracking-tight leading-tight">
            Explorez le monde, réservez en toute sérénité.
          </h2>
          <p className="text-sm text-white/80 leading-relaxed font-medium">
            Accédez à vos offres d'hôtels personnalisées, comparez les tarifs en temps réel et préparez vos prochains séjours avec notre sélection haut de gamme.
          </p>
        </div>

        {/* PIED DE PAGE / STATS / ASSURANCE */}
        <div className="relative z-10 flex flex-col gap-3 pt-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <span className="flex size-7 items-center justify-center rounded-full bg-emerald-500 border-2 border-slate-900 text-[10px] font-bold">✓</span>
              <span className="flex size-7 items-center justify-center rounded-full bg-amber-500 border-2 border-slate-900 text-[10px] font-bold">★</span>
            </div>
            <p className="text-xs text-white/70 font-semibold">
              Plus de 10 000 hébergements répertoriés à travers le monde.
            </p>
          </div>
        </div>
      </div>

      {/* COLONNE DROITE : FORMULAIRE DE CONNEXION */}
      <div className="lg:col-span-7 xl:col-span-6 flex items-center justify-center p-6 sm:p-12 md:p-16 bg-background">
        <div className="w-full max-w-[390px] space-y-8">
          
          {/* EN-TÊTE ÉPURÉ (Visible sur tous les écrans) */}
          <div className="space-y-2">
            <div className="lg:hidden flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
              <Compass className="size-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              {t("loginTitle") ?? "Ravi de vous revoir"}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground/80 font-medium">
              Saisissez vos identifiants pour accéder à votre espace.
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4.5">
              
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
                        autoComplete="current-password" 
                        placeholder="••••••••"
                        className="rounded-xl border-border/70 h-10 text-sm font-medium focus-visible:ring-primary/20 placeholder:text-muted-foreground/45 transition-all"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-[11px] font-bold text-destructive" />
                  </FormItem>
                )}
              />

              {/* BOUTON DE CONNEXION */}
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full rounded-xl font-bold text-xs gap-1.5 h-10.5 py-4 shadow-2xs transition-all active:scale-98 mt-3"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin shrink-0" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <LogIn className="size-3.5 stroke-[2.2]" />
                    {t("loginSubmit") ?? "Se connecter"}
                  </>
                )}
              </Button>
            </form>
          </Form>

          {/* LIEN D'INSCRIPTION */}
          <div className="text-center text-xs sm:text-sm text-muted-foreground/90 font-medium pt-2">
            {t("noAccount") ?? "Pas encore de compte ?"}{" "}
            <Link 
              href="/register" 
              className="font-bold text-primary underline-offset-4 hover:underline transition-all"
            >
              {t("switchToRegister") ?? "Créer un compte"}
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
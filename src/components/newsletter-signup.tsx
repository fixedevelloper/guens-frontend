"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Building2, Bell, CheckCircle2, Mail, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { subscribeNewsletter } from "@/lib/api/newsletter";

const schema = z.object({
  email: z.string().trim().min(1).email(),
});

type FormValues = z.infer<typeof schema>;

interface NewsletterSignupProps {
  source: "FLIGHT_PAGE" | "HOTEL_PAGE";
  variant: "flights" | "hotels";
}

/**
 * Newsletter signup banner reused on the Flight and Hotel results pages. Each page already shipped
 * this exact gradient CTA design (see Cta.flights/Cta.hotels translation keys); only the submit
 * handler was previously a no-op. Idempotent backend (repeat submits of the same email are treated
 * as success, never a distinct "already subscribed" error).
 */
export function NewsletterSignup({ source, variant }: NewsletterSignupProps) {
  const t = useTranslations(variant === "flights" ? "Cta.flights" : "Cta.hotels");
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });
  const isSuccess = form.formState.isSubmitSuccessful;

  async function onSubmit(values: FormValues) {
    try {
      await subscribeNewsletter(values.email, source);
    } catch {
      form.setError("email", { message: t("error") });
      throw new Error("subscribe failed");
    }
  }

  const formBlock = (
      <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={
            variant === "flights"
                ? "flex flex-col gap-3 rounded-2xl border border-white/20 bg-white/10 p-3 shadow-inner backdrop-blur-md sm:p-4"
                : "flex flex-col gap-3 bg-white/10 p-3 sm:p-4 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner"
          }
      >
        {isSuccess ? (
            <div className="flex items-center gap-2 py-2.5 text-sm font-semibold text-white">
              <CheckCircle2 className="size-5 text-[#7bcd4f]" />
              {t("success")}
            </div>
        ) : (
            <>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/70" />
                <input
                    type="email"
                    placeholder={t("placeholder")}
                    {...form.register("email")}
                    className={
                      variant === "flights"
                          ? "w-full rounded-xl border border-white/10 bg-white/15 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/70 focus:outline-none"
                          : "w-full rounded-xl bg-white/15 pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-[#7bcd4f] border border-white/10 transition-all"
                    }
                />
              </div>
              {form.formState.errors.email && (
                  <p className="text-xs font-medium text-white/90">{form.formState.errors.email.message}</p>
              )}
              <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className={
                    variant === "flights"
                        ? "w-full rounded-xl bg-[#7bcd4f] py-5 font-bold text-slate-950 shadow-lg transition-all active:scale-95 hover:bg-[#6ebd44]"
                        : "w-full rounded-xl bg-[#7bcd4f] hover:bg-[#6ebd44] py-6 font-bold text-slate-950 active:scale-95 shadow-lg shadow-[#7bcd4f]/25 transition-all duration-200"
                  }
              >
                <Bell className="mr-2 size-4" />
                {form.formState.isSubmitting ? t("subscribing") : t("button")}
              </Button>
            </>
        )}
      </form>
  );

  if (variant === "flights") {
    return (
        <div className="relative mt-12 overflow-hidden rounded-3xl bg-gradient-to-br from-[#15a4e6] via-[#128bc3] to-[#0c6b99] p-6 text-white shadow-xl sm:p-8 lg:p-10">
          <div className="relative z-10 grid gap-6 lg:grid-cols-12 lg:items-center">
            <div className="space-y-3 text-center lg:col-span-7 lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3.5 py-1 text-xs font-bold backdrop-blur-md">
                <Sparkles className="size-3.5 text-[#7bcd4f]" />
                <span>{t("badge")}</span>
              </div>
              <h2 className="text-xl font-black leading-tight sm:text-3xl lg:text-4xl">{t("title")}</h2>
              <p className="max-w-xl text-xs text-white/90 sm:text-sm lg:text-base">{t("description")}</p>
            </div>
            <div className="lg:col-span-5">{formBlock}</div>
          </div>
        </div>
    );
  }

  return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#15a4e6] via-[#128bc3] to-[#0c6b99] p-6 sm:p-10 text-white shadow-xl mt-8">
        <div className="absolute -top-20 -right-20 size-72 rounded-full bg-[#7bcd4f]/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 size-72 rounded-full bg-[#7bcd4f]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7 space-y-3.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-3.5 py-1 text-xs font-bold text-white backdrop-blur-md">
              <Building2 className="size-3.5 text-[#7bcd4f]" />
              <span>{t("badge")}</span>
            </div>

            <h2 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl leading-tight">
              {t("title")}
            </h2>

            <p className="text-white/90 text-sm sm:text-base max-w-xl leading-relaxed">{t("description")}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs font-semibold text-white/95">
              <div className="flex items-center gap-1.5 bg-black/10 rounded-lg px-2.5 py-1 backdrop-blur-xs">
                <CheckCircle2 className="size-4 text-[#7bcd4f]" />
                <span>{t("negotiated")}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/10 rounded-lg px-2.5 py-1 backdrop-blur-xs">
                <ShieldCheck className="size-4 text-[#7bcd4f]" />
                <span>{t("easyUnsubscribe")}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">{formBlock}</div>
        </div>
      </div>
  );
}

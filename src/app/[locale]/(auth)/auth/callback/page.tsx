"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, XCircle } from "lucide-react";

import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/context/auth-context";
import { Alert, AlertDescription } from "@/components/ui/alert";

const PARTNER_ROLES = [
  "PARTNER_AIRLINE",
  "PARTNER_HOTEL",
  "PARTNER_CAR_RENTAL",
  "PARTNER_FURNISHED_RENTAL",
] as const;

/**
 * Landing page for the Google/Facebook login redirect: the backend (OAuth2LoginSuccessHandler)
 * already set the HttpOnly auth cookie before sending the browser here, with only ?error=...
 * appended on denial/failure - nothing sensitive travels over the URL. The profile is fetched via
 * completeSocialLogin, exactly like the tail end of a classic email/password login.
 */
export default function SocialLoginCallbackPage() {
  return (
    <Suspense fallback={<FinalizingState />}>
      <SocialLoginCallbackContent />
    </Suspense>
  );
}

function SocialLoginCallbackContent() {
  const t = useTranslations("Auth");
  const searchParams = useSearchParams();
  const router = useRouter();
  const { completeSocialLogin } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    const providerError = searchParams.get("error");

    if (providerError) {
      setError(providerError);
      return;
    }

    completeSocialLogin()
        .then((profile) => {
          if (profile.role === "ADMIN") {
            router.replace("/admin");
          } else if (PARTNER_ROLES.includes(profile.role as (typeof PARTNER_ROLES)[number])) {
            router.replace("/partner");
          } else {
            router.replace("/dashboard");
          }
        })
        .catch(() => setError(t("socialLoginFailed")));
  }, [searchParams, completeSocialLogin, router, t]);

  if (error) {
    return (
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
          <Alert variant="destructive" className="rounded-2xl border-destructive/25 bg-destructive/[0.03]">
            <XCircle className="size-5" />
            <AlertDescription className="font-medium text-destructive">
              {error}
            </AlertDescription>
          </Alert>
          <Link
              href="/login"
              className="mt-6 inline-block text-sm font-bold text-primary underline-offset-4 hover:underline"
          >
            {t("socialLoginBackToLogin")}
          </Link>
        </div>
    );
  }

  return <FinalizingState />;
}

function FinalizingState() {
  const t = useTranslations("Auth");
  return (
      <div className="mx-auto max-w-xl px-4 py-24 flex flex-col items-center gap-3 text-center">
        <Loader2 className="size-6 animate-spin text-primary" />
        <p className="text-sm font-semibold text-muted-foreground">
          {t("socialLoginFinalizing")}
        </p>
      </div>
  );
}

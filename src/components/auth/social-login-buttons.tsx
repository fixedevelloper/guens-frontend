import { useTranslations } from "next-intl";

/**
 * Plain <a> links (full-page navigation, not client-side routing): these hit the backend's
 * Spring Security OAuth2 endpoints directly (/oauth2/authorization/{provider}), which redirect
 * the whole browser to Google/Facebook's consent screen - not something axios/fetch can do.
 */
export function SocialLoginButtons() {
  const t = useTranslations("Auth");
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/";

  return (
    <div className="space-y-3">
      <div className="relative flex items-center py-1">
        <div className="flex-grow border-t border-border/60" />
        <span className="mx-3 text-[11px] font-bold uppercase tracking-wide text-muted-foreground/70">
          {t("orContinueWith")}
        </span>
        <div className="flex-grow border-t border-border/60" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <a
          href={`${apiBaseUrl}/oauth2/authorization/google`}
          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-border/70 text-xs font-bold transition-all hover:bg-muted/60 active:scale-98"
        >
          <GoogleIcon className="size-4" />
          <span className="hidden sm:inline">Google</span>
        </a>
        <a
          href={`${apiBaseUrl}/oauth2/authorization/facebook`}
          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-border/70 text-xs font-bold transition-all hover:bg-muted/60 active:scale-98"
        >
          <FacebookIcon className="size-4" />
          <span className="hidden sm:inline">Facebook</span>
        </a>
      </div>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.85-.08-1.66-.22-2.45H12v4.63h6.44c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.8z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1C3.25 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.61H1.27A11.98 11.98 0 000 12c0 1.94.46 3.77 1.27 5.39l4-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.61l4 3.1C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.95.93-1.95 1.89v2.27h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z" />
    </svg>
  );
}

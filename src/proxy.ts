import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

// Kept in sync with app.jwt.cookie-name (default) in application.yml / JwtProperties.
const AUTH_COOKIE_NAME = "gt_auth";
const PROTECTED_PATH = /^\/(?:(?:en|fr)\/)?(admin|partner)(?:\/|$)/;

function loginPathFor(pathname: string): string {
  const match = pathname.match(/^\/(en|fr)(?:\/|$)/);
  if (match && match[1] !== routing.defaultLocale) {
    return `/${match[1]}/login`;
  }
  return "/login";
}

/**
 * Runs the existing next-intl locale routing first, then - for the admin/partner dashboards only
 * - checks for the HttpOnly gt_auth cookie before letting the request through. This is only a UX
 * shortcut (skip serving/hydrating a dashboard shell that the client-side (dashboard) layouts
 * would immediately redirect away from anyway); it is NOT the source of truth for authorization -
 * the Spring API re-validates the cookie's JWT on every single request regardless. A Proxy can
 * read HttpOnly cookies (only client-side `document.cookie` is blocked), so this check works even
 * though the cookie is unreadable from the browser's JS.
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PROTECTED_PATH.test(pathname) && !request.cookies.has(AUTH_COOKIE_NAME)) {
    return NextResponse.redirect(new URL(loginPathFor(pathname), request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

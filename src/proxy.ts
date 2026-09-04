import createIntlMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";

import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

/**
 * Only runs next-intl's locale routing. A previous version also gated /workspace and /partner
 * here on the HttpOnly gt_auth cookie as a UX shortcut (skip serving a dashboard shell the
 * client-side layout would immediately redirect away from) - removed because it can never work:
 * the API (api-guentours.guens.org) and the frontend (guenstravel.com) are on unrelated domains,
 * so gt_auth is a host-only cookie scoped to the API and is never present in requests to
 * guenstravel.com. The check always saw "no cookie" and bounced even correctly-authenticated
 * admins to /login (confirmed prod bug, 2026-09-01). Authorization itself was never affected -
 * the Spring API re-validates the JWT on every request regardless - and the client-side
 * (dashboard) layouts already redirect unauthenticated visitors via useAuth(), which does see the
 * cookie (attached cross-origin by the API client). Revisit only if the API is ever served from
 * the same origin as the frontend (e.g. guenstravel.com/api/* reverse-proxied to Spring), which
 * would make the cookie shareable and this shortcut viable again.
 */
export default function proxy(request: NextRequest) {
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

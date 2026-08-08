import type { MetadataRoute } from "next";
import { headers } from "next/headers";

import { getRequestBaseUrl } from "@/lib/site-url";

// Only the `en` locale carries a URL prefix (routing.ts: localePrefix "as-needed", defaultLocale
// "fr") - every disallowed path is listed both unprefixed (fr) and under /en so both locales are
// covered.
const DISALLOWED_SEGMENTS = ["checkout", "payment", "payments", "bookings", "dashboard", "admin", "partner", "auth"];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = getRequestBaseUrl(await headers());

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: DISALLOWED_SEGMENTS.flatMap((segment) => [`/${segment}`, `/en/${segment}`]),
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Only the `en` locale carries a URL prefix (routing.ts: localePrefix "as-needed", defaultLocale
// "fr") - every disallowed path is listed both unprefixed (fr) and under /en so both locales are
// covered.
const DISALLOWED_SEGMENTS = ["checkout", "payment", "payments", "bookings", "dashboard", "admin", "partner", "auth"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: DISALLOWED_SEGMENTS.flatMap((segment) => [`/${segment}`, `/en/${segment}`]),
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}

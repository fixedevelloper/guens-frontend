import { routing } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";
import { getRequestBaseUrl } from "@/lib/site-url";

type ChangeFrequency = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

/**
 * Public, evergreen marketing/content pages only. Deliberately excludes:
 * - auth-gated areas (/dashboard, /admin/**, /partner/**) and transactional flows
 *   (/checkout, /payment/**, /bookings/**) - nothing there is meant to be indexed.
 * - /hotels/[hotelName] - a search-result detail page that only renders meaningfully with live
 *   query params (offerId, checkIn/checkOut) carried over from a search; it has no stable
 *   canonical URL to enumerate here.
 */
const ROUTES: Array<{ href: string; changeFrequency: ChangeFrequency; priority: number }> = [
  { href: "/", changeFrequency: "daily", priority: 1 },
  { href: "/flights", changeFrequency: "daily", priority: 0.9 },
  { href: "/flights/multi-city", changeFrequency: "daily", priority: 0.7 },
  { href: "/hotels", changeFrequency: "daily", priority: 0.9 },
  { href: "/car-rentals", changeFrequency: "daily", priority: 0.8 },
  { href: "/car-rentals/search", changeFrequency: "daily", priority: 0.6 },
  { href: "/furnished-rentals", changeFrequency: "daily", priority: 0.8 },
  { href: "/furnished-rentals/search", changeFrequency: "daily", priority: 0.6 },
  { href: "/become-host", changeFrequency: "monthly", priority: 0.5 },
  { href: "/become-reseller", changeFrequency: "monthly", priority: 0.5 },
  { href: "/legal/terms", changeFrequency: "yearly", priority: 0.3 },
  { href: "/legal/privacy", changeFrequency: "yearly", priority: 0.3 },
];

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildSitemapXml(baseUrl: string): string {
  const lastModified = new Date().toISOString();

  const urls = ROUTES.map(({ href, changeFrequency, priority }) => {
    const loc = `${baseUrl}${getPathname({ locale: routing.defaultLocale, href })}`;
    const alternates = [
      ...routing.locales.map(
          (locale) =>
              `<xhtml:link rel="alternate" hreflang="${locale}" href="${escapeXml(`${baseUrl}${getPathname({ locale, href })}`)}" />`
      ),
      `<xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(loc)}" />`,
    ].join("\n");

    return `<url>
<loc>${escapeXml(loc)}</loc>
${alternates}
<lastmod>${lastModified}</lastmod>
<changefreq>${changeFrequency}</changefreq>
<priority>${priority}</priority>
</url>`;
  }).join("\n");

  // The xml-stylesheet PI lets a browser render this as a readable HTML table (via
  // /sitemap.xsl in public/) while the document underneath stays plain, valid sitemap XML for
  // crawlers - modern Chromium browsers no longer show a tree view for XML navigated to
  // directly, so without this a hard refresh just shows raw text (not a sign of invalid XML).
  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;
}

export function GET(request: Request) {
  const baseUrl = getRequestBaseUrl(request.headers);
  return new Response(buildSitemapXml(baseUrl), {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}

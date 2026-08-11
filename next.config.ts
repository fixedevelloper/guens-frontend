import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const isDev = process.env.NODE_ENV === "development";

// Resolved at build time from NEXT_PUBLIC_API_URL so the CSP allows XHR/fetch/EventSource calls
// to the Spring backend (booking tracking uses EventSource directly, see use-booking-tracking.ts).
const apiOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080").origin;
  } catch {
    return "";
  }
})();

// No nonces: that requires forcing every page into dynamic rendering (see Next.js CSP guide),
// too invasive to take on as part of a security audit. 'unsafe-inline' on script-src is a real
// tradeoff - it does not defend against inline-script injection - but everything else here
// (frame-ancestors, object-src, base-uri, form-action, connect-src) still meaningfully narrows
// what an XSS payload could do (no framing, no fetching-and-exfiltrating to arbitrary origins,
// no <base>/<object> hijack, no oauth-style form hijack).
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self' data:;
  connect-src 'self' ${apiOrigin};
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

const nextConfig: NextConfig = {
  images: {
    // Our own MinIO bucket (reseller logos, property/vehicle/room cover images) - the only image
    // host under our control, so next/image's automatic resizing/lazy-loading/AVIF-WebP conversion
    // is safe to enable for it. Provider/GDS photos (hotel results, room galleries) come from
    // arbitrary third-party CDN domains that can't be enumerated here, so those stay as native
    // <img loading="lazy"> instead - see hotel-gallery.tsx and friends.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3.guens.org",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader.replace(/\s{2,}/g, " ").trim() },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);

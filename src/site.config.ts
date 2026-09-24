/**
 * Single source of truth for brand strings + site metadata.
 * Rejects *.pages.dev values so preview hosts never leak into canonicals.
 */
const env = import.meta.env;

const DEFAULT_DOMAIN = "devtoy.worksoffline.in";
const DEFAULT_URL = `https://${DEFAULT_DOMAIN}`;

const rawUrl: string = env.PUBLIC_SITE_URL ?? DEFAULT_URL;
const url = (/\.pages\.dev/i.test(rawUrl) ? DEFAULT_URL : rawUrl).replace(/\/$/, "");

export const site = {
  name: env.PUBLIC_SITE_NAME ?? "DevToy",
  tagline: env.PUBLIC_SITE_TAGLINE ?? "Offline developer tools in your browser",
  description:
    env.PUBLIC_SITE_DESCRIPTION ??
    "Free offline developer tools: JSON formatter, JWT decoder, Base64, regex tester and Unix timestamp converter. Runs 100% in your browser — your data never leaves your device.",
  url,
  domain: new URL(url).host,
  gaId: env.PUBLIC_GA_ID ?? "G-Q1Y0YHLJ8K",
  publisher: { name: "WorksOffline", url: "https://worksoffline.in" },
  /** Freshness constant — shown as "Last updated" + JSON-LD dateModified. */
  lastUpdated: "2026-09-24",
};

export const absoluteUrl = (path = "/") => `${site.url}${path.startsWith("/") ? path : "/" + path}`;

export const lastUpdatedLabel = () =>
  new Date(site.lastUpdated + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

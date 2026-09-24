import { site, absoluteUrl } from "../site.config";
import { toolPages } from "./tools";

export const homeTldr =
  "DevToy is a free set of developer tools — JSON formatter, JWT decoder, Base64, regex tester and Unix timestamp converter — that runs entirely in your browser with no sign-up. Paste anything and Smart Paste opens the right tool. Limits: JWT signatures are not verified and very large inputs depend on your device's memory.";

export const homeFaqs = [
  { q: "What is DevToy?", a: "A set of free developer utilities — JSON formatter, JWT decoder, Base64 encoder/decoder, regex tester and Unix timestamp converter — that run entirely in your browser." },
  { q: "What is Smart Paste?", a: "Paste anything onto the page and DevToy detects whether it looks like JSON, a JWT, Base64, a Unix timestamp or a regex, then opens the matching tool with your content loaded." },
  { q: "Is my data sent to a server?", a: "No. All processing is done with JavaScript in your browser tab. The only network requests are for the page itself, web fonts and Google Analytics page-view tracking; the content you paste is not transmitted." },
  { q: "Is DevToy free?", a: "Yes. Every tool is free to use with no account, and there are no usage limits beyond what your browser can handle." },
];

/** WebApplication JSON-LD for a page (home or a tool page). */
export function webAppLd(opts: { name: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: opts.name,
    description: opts.description,
    url: absoluteUrl(opts.path),
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any (web browser)",
    browserRequirements: "Requires JavaScript",
    isAccessibleForFree: true,
    offers: [
      { "@type": "Offer", price: "0", priceCurrency: "USD" },
      { "@type": "Offer", price: "0", priceCurrency: "INR" },
    ],
    dateModified: site.lastUpdated,
    publisher: { "@type": "Organization", name: site.publisher.name, url: site.publisher.url },
  };
}

export const allPages = () => [
  { path: "/", title: `${site.name} — all-in-one Smart Paste`, desc: "Paste anything; auto-detects JSON, JWT, Base64, timestamps and regex." },
  ...toolPages.map((p) => ({ path: `/${p.slug}/`, title: p.h1, desc: p.metaDescription })),
];

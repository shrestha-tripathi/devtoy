import type { APIRoute } from "astro";
import { absoluteUrl, site } from "../site.config";
import { toolPages } from "../data/tools";

export const GET: APIRoute = () => {
  const paths = ["/", ...toolPages.map((p) => `/${p.slug}/`)];
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    paths
      .map(
        (p) =>
          `  <url><loc>${absoluteUrl(p)}</loc><lastmod>${site.lastUpdated}</lastmod><changefreq>monthly</changefreq><priority>${p === "/" ? "1.0" : "0.8"}</priority></url>`,
      )
      .join("\n") +
    `\n</urlset>\n`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};

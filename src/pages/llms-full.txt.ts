import type { APIRoute } from "astro";
import { site, absoluteUrl } from "../site.config";
import { homeTldr, homeFaqs } from "../data/geo";
import { toolPages } from "../data/tools";

export const GET: APIRoute = () => {
  const parts = [
    `# ${site.name}\n\n> ${site.description}\n\n${homeTldr}\n\nURL: ${absoluteUrl("/")}\nLast updated: ${site.lastUpdated}`,
    `## FAQ\n\n${homeFaqs.map((f) => `### ${f.q}\n${f.a}`).join("\n\n")}`,
    ...toolPages.map(
      (p) =>
        `## ${p.h1}\n\nURL: ${absoluteUrl(`/${p.slug}/`)}\n\n${p.intro}\n\n### How to use\n${p.steps
          .map((s, i) => `${i + 1}. ${s}`)
          .join("\n")}\n\n${p.tips?.length ? `### Tips\n${p.tips.map((t) => `- ${t}`).join("\n")}\n\n` : ""}### FAQ\n${p.faqs
          .map((f) => `**${f.q}**\n${f.a}`)
          .join("\n\n")}`,
    ),
  ];
  return new Response(parts.join("\n\n---\n\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};

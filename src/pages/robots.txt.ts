import type { APIRoute } from "astro";
import { absoluteUrl } from "../site.config";

const bots = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
];

export const GET: APIRoute = () =>
  new Response(
    `User-agent: *\nAllow: /\n\n` +
      bots.map((b) => `User-agent: ${b}\nAllow: /\n`).join("\n") +
      `\nSitemap: ${absoluteUrl("/sitemap.xml")}\n`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );

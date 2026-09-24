import type { APIRoute } from "astro";
import { site, absoluteUrl } from "../site.config";
import { homeTldr, allPages } from "../data/geo";

export const GET: APIRoute = () => {
  const body = `# ${site.name}

> ${site.description}

${homeTldr}

## Privacy
All tools run client-side in JavaScript. Pasted content is processed in the browser tab and is not sent to any server. The site loads web fonts and Google Analytics for page-view statistics.

## Limits
- The JWT decoder decodes but does not verify signatures.
- The regex tester uses the browser's JavaScript (ECMAScript) RegExp engine, not PCRE.
- Base64 decoding expects UTF-8 text output.
- Input size is bounded only by device memory.

## Pages
${allPages().map((p) => `- [${p.title}](${absoluteUrl(p.path)}): ${p.desc}`).join("\n")}

## Optional
- [Full content for LLMs](${absoluteUrl("/llms-full.txt")})
- Last updated: ${site.lastUpdated}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};

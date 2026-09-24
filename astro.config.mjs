// @ts-check
import { defineConfig } from "astro/config";

// Static output for Cloudflare Pages (build: `npm run build`, output: `dist`).
export default defineConfig({
  site: "https://devtoy.worksoffline.in",
  trailingSlash: "always",
  build: { format: "directory" },
  vite: { build: { target: "esnext" } },
});

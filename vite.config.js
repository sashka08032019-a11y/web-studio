import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Один источник правды по домену: .env → canonical/og-теги, robots.txt, sitemap.xml
  const siteUrl = (env.VITE_SITE_URL || "https://example.com").replace(/\/+$/, "");
  const outDir = resolve(process.cwd(), "dist");

  return {
    plugins: [vue()],

    build: {
      // Всегда чистим dist, иначе в деплой уедут старые файлы из public/
      emptyOutDir: true,
    },

    ssgOptions: {
      entry: "src/main.js",
      formatting: "minify",
      /** robots.txt и sitemap.xml генерируются из VITE_SITE_URL */
      async onFinished() {
        const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;

        await Promise.all([
          writeFile(resolve(outDir, "robots.txt"), robots, "utf8"),
          writeFile(resolve(outDir, "sitemap.xml"), sitemap, "utf8"),
        ]);
      },
    },
  };
});

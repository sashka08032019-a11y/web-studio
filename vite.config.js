import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getSiteUrl } from "./scripts/site-url.mjs";

export default defineConfig(({ mode }) => {
  // Один источник правды по домену: .env → canonical/og-теги, robots.txt, sitemap.xml
  // (тем же значением пользуется scripts/check-seo.mjs)
  const siteUrl = getSiteUrl(mode);
  const outDir = resolve(process.cwd(), "dist");

  /**
   * robots.txt и sitemap.xml нужны и при полной сборке (vite-ssg), и при
   * запасной SPA-сборке, поэтому пишем их в closeBundle, а не в ssgOptions.
   */
  const seoFiles = () => ({
    name: "seo-files",
    async closeBundle() {
      const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

      // Сайт одностраничный: единственный канонический URL — главная.
      // lastmod не указываем, надёжной даты изменения контента нет.
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
  </url>
</urlset>
`;

      await mkdir(outDir, { recursive: true });
      await Promise.all([
        writeFile(resolve(outDir, "robots.txt"), robots, "utf8"),
        writeFile(resolve(outDir, "sitemap.xml"), sitemap, "utf8"),
      ]);
    },
  });

  return {
    plugins: [vue(), seoFiles()],

    build: {
      // Всегда чистим dist, иначе в деплой уедут старые файлы из public/
      emptyOutDir: true,
    },

    ssgOptions: {
      entry: "src/main.js",
      formatting: "minify",
    },
  };
});

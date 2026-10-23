#!/usr/bin/env node
/**
 * Проверка SEO собранного сайта. Запускается после сборки (`npm run build`)
 * и падает с ненулевым кодом, если метатеги или robots.txt/sitemap.xml
 * разъехались с данными сайта.
 *
 * Проверяется именно dist/, то есть то, что уедет на хостинг, а не исходники.
 * Использование: node scripts/check-seo.mjs [--dir dist] [--spa]
 * `--spa` отключает проверки пре-рендера: запасная SPA-сборка отдаёт пустой
 * #app и контент появляется только после выполнения JS.
 */
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getSiteUrl } from "./site-url.mjs";

const argv = process.argv.slice(2);
const dirFlag = argv.indexOf("--dir");
const outDir = resolve(process.cwd(), dirFlag === -1 ? "dist" : argv[dirFlag + 1]);
const isSpa = argv.includes("--spa");

const siteUrl = getSiteUrl();
const expectedPage = `${siteUrl}/`;
const origin = new URL(expectedPage).origin;

let checks = 0;
const failures = [];

/** Регистрирует одну проверку; возвращает результат для дальнейших ветвлений. */
function expect(ok, message) {
  checks += 1;
  if (!ok) failures.push(message);
  return ok;
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

/** Разбирает атрибуты HTML-тега в объект (имена в нижнем регистре). */
function parseAttrs(tag) {
  const body = tag
    .replace(/^<\s*\/?\s*[a-z0-9-]+/i, "")
    .replace(/\/?>\s*$/, "");
  const attrs = {};
  const re = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;
  while ((match = re.exec(body))) {
    const value = match[2] ?? match[3] ?? match[4] ?? "";
    attrs[match[1].toLowerCase()] = decodeEntities(value);
  }
  return attrs;
}

function flattenJsonLd(node, acc = []) {
  if (Array.isArray(node)) {
    node.forEach((item) => flattenJsonLd(item, acc));
    return acc;
  }
  if (node && typeof node === "object") {
    if (node["@graph"]) flattenJsonLd(node["@graph"], acc);
    if (node["@type"]) acc.push(node);
  }
  return acc;
}

async function readOrRecord(path, label) {
  try {
    return await readFile(path, "utf8");
  } catch {
    expect(false, `${label}: файл не найден (${path})`);
    return null;
  }
}

const [html, robots, sitemap] = await Promise.all([
  readOrRecord(resolve(outDir, "index.html"), "index.html"),
  readOrRecord(resolve(outDir, "robots.txt"), "robots.txt"),
  readOrRecord(resolve(outDir, "sitemap.xml"), "sitemap.xml"),
]);

if (html) {
  /* ---------- Базовая разметка и пре-рендер ---------- */
  const htmlTag = parseAttrs((html.match(/<html\b[^>]*>/i) || [""])[0]);
  expect(htmlTag.lang === "ru", 'index.html: у <html> должен быть lang="ru"');

  const metas = [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => parseAttrs(m[0]));
  const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => parseAttrs(m[0]));

  const metaValue = (attr, name) => {
    const found = metas.filter(
      (meta) => (meta[attr] || "").toLowerCase() === name.toLowerCase(),
    );
    expect(
      found.length === 1,
      `index.html: ожидался ровно один <meta ${attr}="${name}">, найдено ${found.length}`,
    );
    return (found[0]?.content || "").trim();
  };

  expect(
    metas.some((meta) => meta.name === "viewport" && /width=device-width/i.test(meta.content)),
    "index.html: нет корректного meta viewport",
  );

  if (!isSpa) {
    // Пустой #app означает, что пре-рендер не сработал и уехал пустой каркас.
    expect(
      !/<div id="app"[^>]*>\s*<\/div>/i.test(html),
      "index.html: #app пустой — пре-рендер не выполнился",
    );
    expect(
      (html.match(/<h1\b/gi) || []).length === 1,
      "index.html: на странице должен быть ровно один <h1>",
    );
  }

  /* ---------- title и description ---------- */
  const titles = [...html.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gi)];
  expect(titles.length === 1, `index.html: ожидался ровно один <title>, найдено ${titles.length}`);
  const title = decodeEntities((titles[0]?.[1] || "").trim());
  expect(title.length >= 15 && title.length <= 70, `title: длина ${title.length}, нужно 15–70 символов`);

  const description = metaValue("name", "description");
  expect(
    description.length >= 50 && description.length <= 180,
    `description: длина ${description.length}, нужно 50–180 символов`,
  );
  expect(description !== title, "description: не должен дублировать title");

  /* ---------- canonical ---------- */
  const canonicalTags = links.filter((link) => (link.rel || "").toLowerCase() === "canonical");
  expect(canonicalTags.length === 1, `canonical: ожидался ровно один, найдено ${canonicalTags.length}`);
  const canonical = canonicalTags[0]?.href || "";
  const canonicalUrl = (() => {
    try {
      return new URL(canonical);
    } catch {
      return null;
    }
  })();
  expect(Boolean(canonicalUrl), `canonical: не абсолютный URL (${canonical || "пусто"})`);
  if (canonicalUrl) {
    expect(canonicalUrl.protocol === "https:", `canonical: нужен https (${canonical})`);
    expect(canonicalUrl.origin === origin, `canonical: домен ${canonicalUrl.origin} не совпадает с ${origin}`);
    expect(canonicalUrl.pathname === "/", `canonical: путь должен быть "/" (${canonical})`);
    expect(!canonicalUrl.search && !canonicalUrl.hash, `canonical: без query/hash (${canonical})`);
    expect(canonical === expectedPage, `canonical: ожидался ${expectedPage}, получен ${canonical}`);
  }

  /* ---------- Open Graph / Twitter ---------- */
  expect(metaValue("property", "og:type") === "website", "og:type: ожидался website");
  expect(metaValue("property", "og:title") === title, "og:title: должен совпадать с <title>");
  expect(
    metaValue("property", "og:description") === description,
    "og:description: должен совпадать с description",
  );
  expect(metaValue("property", "og:url") === canonical, "og:url: должен совпадать с canonical");

  const ogImage = metaValue("property", "og:image");
  const ogImageUrl = (() => {
    try {
      return new URL(ogImage);
    } catch {
      return null;
    }
  })();
  expect(Boolean(ogImageUrl), `og:image: не абсолютный URL (${ogImage || "пусто"})`);
  if (ogImageUrl) {
    expect(ogImageUrl.origin === origin, `og:image: домен ${ogImageUrl.origin} не совпадает с ${origin}`);
    expect(
      existsSync(resolve(outDir, `.${ogImageUrl.pathname}`)),
      `og:image: файла ${ogImageUrl.pathname} нет в сборке`,
    );
  }
  const twitterCard = metaValue("name", "twitter:card");
  expect(["summary", "summary_large_image"].includes(twitterCard), `twitter:card: неизвестное значение "${twitterCard}"`);

  /* ---------- indexability и подстановка переменных ---------- */
  expect(
    !metas.some((meta) => (meta.name || "").toLowerCase() === "robots" && /noindex/i.test(meta.content)),
    "index.html: главная закрыта от индексации (noindex)",
  );

  const placeholders = [
    ["%VITE_", "незаменённая переменная Vite"],
    ["example.com", "шаблонный домен example.com"],
    ["you@example", "шаблонный e-mail"],
    ["t.me/username", "шаблонная ссылка Telegram"],
    ["Vite App", "заголовок по умолчанию"],
    ["Lorem ipsum", "рыбный текст"],
  ];
  for (const [needle, label] of placeholders) {
    expect(!html.includes(needle), `index.html: остался плейсхолдер — ${label} (${needle})`);
  }

  /* ---------- JSON-LD ---------- */
  const ldBlocks = [];
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attrs = parseAttrs(`<script ${match[1]}>`);
    if ((attrs.type || "").toLowerCase() === "application/ld+json") {
      ldBlocks.push(match[2]);
    }
  }
  expect(ldBlocks.length > 0, "JSON-LD: разметка не найдена");

  const jsonLd = [];
  ldBlocks.forEach((block, index) => {
    try {
      flattenJsonLd(JSON.parse(block), jsonLd);
    } catch (error) {
      expect(false, `JSON-LD #${index + 1}: невалидный JSON — ${error.message}`);
    }
  });

  const nodeOfType = (type) => jsonLd.find((node) => [].concat(node["@type"]).includes(type));
  const person = nodeOfType("Person");
  const website = nodeOfType("WebSite");
  expect(Boolean(person), "JSON-LD: нет узла Person");
  expect(Boolean(website), "JSON-LD: нет узла WebSite");

  if (person) {
    expect(
      typeof person.name === "string" && person.name.trim().length >= 2,
      "JSON-LD Person: пустое имя",
    );
    expect(person.url === expectedPage, `JSON-LD Person.url: ожидался ${expectedPage}`);
    expect(
      typeof person.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(person.email),
      "JSON-LD Person: некорректный email",
    );
    expect(Array.isArray(person.sameAs) && person.sameAs.length > 0, "JSON-LD Person: пустой sameAs");
    for (const link of [].concat(person.sameAs || [])) {
      expect(
        /^https:\/\/\S+$/.test(link) && !link.includes("example.com") && !link.includes("username"),
        `JSON-LD Person.sameAs: шаблонная или невалидная ссылка (${link})`,
      );
    }
  }
  if (website) {
    expect(website.url === expectedPage, `JSON-LD WebSite.url: ожидался ${expectedPage}`);
    expect(website.inLanguage === "ru", 'JSON-LD WebSite: inLanguage должен быть "ru"');
  }

  /* ---------- статика для соцсетей ---------- */
  for (const [path, label] of [
    ["favicon.ico", "favicon.ico"],
    ["apple-touch-icon.png", "apple-touch-icon.png"],
  ]) {
    expect(existsSync(resolve(outDir, path)), `index.html: ${label} отсутствует в сборке`);
  }
}

/* ---------- robots.txt ---------- */
if (robots) {
  const lines = robots.split(/\r?\n/).map((line) => line.trim());
  expect(robots.length > 0, "robots.txt: пустой файл");
  expect(
    lines.some((line) => /^user-agent:\s*\*$/i.test(line)),
    "robots.txt: нет правила User-agent: *",
  );
  expect(lines.some((line) => /^allow:\s*\/$/i.test(line)), "robots.txt: нет Allow: /");
  expect(
    !lines.some((line) => /^disallow:\s*\/\s*$/i.test(line)),
    "robots.txt: Disallow: / закрывает весь сайт",
  );

  const sitemapDirectives = lines
    .filter((line) => /^sitemap:/i.test(line))
    .map((line) => line.replace(/^sitemap:\s*/i, ""));
  expect(sitemapDirectives.length === 1, `robots.txt: ожидалась одна директива Sitemap, найдено ${sitemapDirectives.length}`);
  expect(
    sitemapDirectives[0] === `${origin}/sitemap.xml`,
    `robots.txt: Sitemap должен быть ${origin}/sitemap.xml, получен ${sitemapDirectives[0] || "—"}`,
  );
}

/* ---------- sitemap.xml ---------- */
if (sitemap) {
  expect(sitemap.startsWith("<?xml"), "sitemap.xml: нет XML-декларации");
  expect(/<urlset\b/i.test(sitemap), "sitemap.xml: нет корневого <urlset>");
  expect(
    sitemap.includes("http://www.sitemaps.org/schemas/sitemap/0.9"),
    "sitemap.xml: неверный namespace sitemap",
  );
  expect(/<\/urlset>\s*$/i.test(sitemap), "sitemap.xml: не закрыт <urlset>");

  const locs = [...sitemap.matchAll(/<loc>\s*([^<]*?)\s*<\/loc>/gi)].map((m) => decodeEntities(m[1]));
  expect(locs.length === 1, `sitemap.xml: ожидалась одна страница, найдено ${locs.length}`);
  expect(locs[0] === expectedPage, `sitemap.xml: первая ссылка должна быть ${expectedPage}`);
  expect(new Set(locs).size === locs.length, "sitemap.xml: повторяющиеся <loc>");
  expect(
    (sitemap.match(/<url>/gi) || []).length === (sitemap.match(/<\/url>/gi) || []).length,
    "sitemap.xml: несбалансированные теги <url>",
  );
  expect(!sitemap.includes("example.com"), "sitemap.xml: остался шаблонный домен example.com");
}

/* ---------- итог ---------- */
if (failures.length > 0) {
  console.error(`\nSEO-проверка не пройдена: ${failures.length} из ${checks} проверок.`);
  for (const failure of failures) console.error(`  - ${failure}`);
  console.error("\nСобранный сайт в dist/ не публикуйте: сначала исправьте ошибки.\n");
  process.exit(1);
}

const mode = isSpa ? ", SPA без пре-рендера" : "";
console.log(`SEO-проверка пройдена: ${checks} проверок (dist, домен ${siteUrl}${mode}).`);

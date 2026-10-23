import { loadEnv } from "vite";

// Используется, если VITE_SITE_URL не задан (например, в окружении хостинга)
export const DEFAULT_SITE_URL = "https://web-developer-s.netlify.app";

/** Убирает пробелы и завершающие слэши: домен храним без "/" на конце. */
export function normalizeSiteUrl(value) {
  return String(value || "")
    .trim()
    .replace(/\/+$/, "");
}

/**
 * Единственный источник правды по домену: переменная окружения важнее .env.
 * Им пользуются и генерация robots/sitemap (vite.config.js), и их проверка.
 */
export function getSiteUrl(mode = "production", root = process.cwd()) {
  const env = loadEnv(mode, root, "");
  return normalizeSiteUrl(
    process.env.VITE_SITE_URL || env.VITE_SITE_URL || DEFAULT_SITE_URL,
  );
}

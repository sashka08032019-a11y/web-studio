import { ViteSSG } from "vite-ssg/single-page";
import App from "./App.vue";
import { reveal } from "./directives/reveal.js";
import "./assets/base.css";

/**
 * Точка входа для vite-ssg: при сборке приложение рендерится в статический
 * HTML (контент есть без JS), в браузере Vue гидрирует готовую разметку.
 */
export const createApp = ViteSSG(
  App,
  ({ app }) => {
    app.directive("reveal", reveal);
  },
  // SEO-теги статичные (в index.html), поэтому head-менеджер не нужен
  { useHead: false },
);

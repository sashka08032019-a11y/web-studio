# Сайт-портфолио (Vue 3 + Vite)

## Запуск

```bash
npm install
npm run dev         # локальная разработка (http://localhost:5173)
npm run build       # пре-рендер + сборка в dist/ (vite-ssg)
npm run build:spa   # запасной вариант: обычная SPA-сборка без пре-рендера
npm run check:seo   # проверка SEO в dist/ (обе сборки вызывают её сами)
npm run preview     # просмотр собранной версии
```

`dist/` содержит статический HTML с готовым контентом — его можно класть на
любой статический хостинг без отдельного сервера и без ожидания JS.

## Как добавить проект

Проекты живут в одном файле — `src/data/project-db.json`. Карточки в блоке
«Портфолио» строятся автоматически по массиву `projects`.

```json
{
  "projects": [
    {
      "id": "уникальный-id",
      "title": "Название проекта",
      "description": "Одно-два предложения о проекте.",
      "image": "/projects/mebel.png",
      "tags": ["Vue", "Node.js"],
      "link": "https://example.com",
      "linkLabel": "Смотреть проект",
      "published": true
    }
  ]
}
```

- `id` — обязателен и уникален (используется как ключ списка).
- `image` — путь к скриншоту 1280×800 (соотношение 16:10). Файлы кладите в
  `public/` (например `public/projects/mebel.png` → `"/projects/mebel.png"`).
  Без изображения блок превью не выводится — заглушек нет.
- `imageAlt` — осмысленное описание скриншота для доступности и поиска.
- `link` — только реальный адрес вида `https://...`; он открывается в новой
  вкладке. Если ссылки нет, кнопка и кликабельное превью не показываются.
- `published: false` — проект скрыт, но данные остаются в файле.

## Структура

```
index.html                     точка входа + SEO-теги (домен из .env)
vite.config.js                 Vue, vite-ssg, генерация robots.txt/sitemap.xml
scripts/site-url.mjs           домен сайта: .env → один источник для сборки и проверки
scripts/check-seo.mjs          проверка метатегов, robots.txt и sitemap.xml в dist/
.env                           VITE_SITE_URL — адрес сайта
src/
  main.js                      точка входа vite-ssg (пре-рендер + гидратация)
  App.vue                      сборка страницы из секций
  assets/base.css              токены, сброс стилей, layout и кнопки
  data/project-db.json         база проектов
  components/
    TheHeader.vue              шапка + мобильное меню
    HeroSection.vue            первый экран с видео-фоном
    ProjectsSection.vue        секция портфолио (читает project-db.json)
    ProjectCard.vue            одна карточка проекта
    ServicesSection.vue        услуги
    ProcessSection.vue         «Как я работаю» (состояние аккордеона)
    AccordionItem.vue          один шаг аккордеона
    ContactSection.vue         контакты
    ContactLink.vue            одна контактная ссылка
    TheFooter.vue              футер
    SectionHeader.vue          общий заголовок секции
    icons/                     иконки контактов
  composables/useScroll.js     отслеживание прокрутки для шапки
  composables/useMediaQuery.js реактивный медиа-запрос
  composables/useAutoplayVideo.js  когда можно включать фоновое видео
  directives/reveal.js         v-reveal — появление блоков при скролле
public/                        статика: logo.png, favicon.ico, hero.mp4, poster.webp, og-image.jpg
media-originals/               оригиналы медиа до сжатия (не в git, удалять после проверки)
```

## Медиа

Ассеты в `public/` сжаты, оригиналы лежат в `media-originals/` (в `.gitignore`, в
деплой не попадают — удалите папку, когда убедитесь, что качество устраивает).

| Файл                 | Было                        | Стало                             |
| -------------------- | --------------------------- | --------------------------------- |
| `hero.mp4`           | 4.3 МБ, 1080p, с аудио      | 0.9 МБ, 720p, без аудио           |
| `poster.webp`        | `poster.jpg` 1.5 МБ (PNG!)  | 49 КБ                             |
| `logo.png`           | `Logo.png` 107 КБ (292×292) | 14 КБ (96×96, показывается 32 px) |
| `favicon.ico`        | PNG, переименованный в .ico | настоящий ICO 16/32/48 — 9 КБ     |
| `apple-touch-icon.png` | —                         | 26 КБ (180×180)                   |
| `og-image.jpg`       | —                           | 73 КБ (1200×630)                  |

Повторить сжатие:

```bash
# видео: 720p, без звуковой дорожки, faststart
ffmpeg -i media-originals/hero.mp4 -an -vf scale=-2:720:flags=lanczos \
  -c:v libx264 -crf 23 -preset slow -pix_fmt yuv420p -movflags +faststart public/hero.mp4

# постер: кадр из видео
ffmpeg -y -ss 1 -i public/hero.mp4 -frames:v 1 -vf scale=1600:-2:flags=lanczos \
  -c:v libwebp -quality 80 public/poster.webp
```

Видео не включается при `prefers-reduced-motion`, включённой экономии трафика и
на медленном соединении (2G/3G) — вместо него сразу показывается постер: см.
`src/composables/useAutoplayVideo.js`.

## Доступность

- Мобильное меню: закрытое ― `inert` + `visibility: hidden` (ссылки не попадают в
  tab-порядок и в дерево скринридеров); при открытии фокус уходит в меню, `Escape`
  закрывает и возвращает фокус на кнопку, прокрутка страницы блокируется.
  Известное ограничение: фокус не зациклен внутри меню — Tab с последней ссылки
  уходит на страницу под панелью.
- Skip-link ведёт на `<main id="main" tabindex="-1">`, поэтому фокус реально
  перемещается в содержимое.
- Аккордеон: кнопка и панель связаны `aria-controls`/`aria-labelledby`,
  панель — `role="region"`, закрытые шаги помечены `inert` и скрыты.
- Все анимации отключаются при `prefers-reduced-motion: reduce`.

## SEO и пре-рендер

Сборка идёт через `vite-ssg`: страница рендерится в `dist/index.html` целиком,
поэтому поисковики и мессенджеры видят контент без выполнения JS. В браузере Vue
гидрирует готовую разметку (интерактивность та же).

- Домен задаётся один раз в `.env` → `VITE_SITE_URL` и оттуда подставляется в
  `canonical`, `og:url`, `og:image` и JSON-LD при сборке. Без завершающего слэша.
  Если переменная не задана, используется адрес продакшена по умолчанию.
- `robots.txt` и `sitemap.xml` генерируются в `closeBundle` (см. `vite.config.js`)
  и при полной сборке, и при `build:spa`. В карте сайта одна запись — главная
  страница; `lastmod` не проставляется, так как достоверной даты изменения нет.
- В `index.html` лежат уникальные title/description, Open Graph/Twitter-теги и
  JSON-LD (`Person` + `WebSite`) с реальными контактами.
- Страница отдаётся статическим HTML: заголовки, тексты и карточки проектов
  видны роботам без выполнения JavaScript.
- `npm run build` и `npm run build:spa` заканчиваются проверкой `dist/`
  (`scripts/check-seo.mjs`, ~65 проверок, без зависимостей). Если проверка не
  прошла, сборка падает с ненулевым кодом и списком ошибок — сломанный
  `dist/` не уедет на хостинг незамеченным. Что проверяется:
  - ровно один `title` (15–70 символов) и `description` (50–180), без
    дублей и без выдуманных значений;
  - `canonical` — один, https, без query/hash, совпадает с `og:url`,
    `VITE_SITE_URL` и `Person`/`WebSite.url` из JSON-LD;
  - Open Graph/Twitter: обязательные теги, `og:image` существует в сборке;
  - JSON-LD парсится как JSON и содержит `Person` и `WebSite` с корректным
    email и абсолютными ссылками;
  - `robots.txt`: `Allow: /`, нет `Disallow: /`, `Sitemap` ведёт на тот же
    домен;
  - `sitemap.xml`: валидная XML-обёртка, ровно одна страница, ссылки без
    дублей и совпадают с `canonical`;
  - нет незаменённых `%VITE_…%`, `example.com`, пустого `#app` и забытых
    `<title>Vite App</title>` / `Lorem ipsum`.

  Проверить конкретную папку можно вручную:
  `node scripts/check-seo.mjs --dir dist` (для SPA-сборки — с флагом `--spa`,
  который отключает проверки пре-рендера).

Пре-рендер стоит ~8 КБ gzip JS (head-менеджер и логика гидратации vite-ssg),
но позволяет отдавать контент сразу, без ожидания бандла.

## Что заменить перед публикацией

0. Домен — в `.env` (`VITE_SITE_URL`), затем `npm run build`. Если хостинг
   собирает проект сам, продублируйте переменную в его настройках окружения.
1. Логотип — `public/logo.png` (96×96), шапка — `src/components/TheHeader.vue`,
   соцсети — `TheFooter.vue` (год в копирайте подставляется автоматически).
2. Title, description и JSON-LD (`Person`) — в `index.html`; меняйте при смене
   имени, контактов или специализации.
3. Тексты hero — `src/components/HeroSection.vue`.
4. Проекты — `src/data/project-db.json`.
5. Услуги и шаги процесса — массивы `services` и `steps` в
   `ServicesSection.vue` / `ProcessSection.vue`.
6. Контакты — массив `contacts` в `ContactSection.vue`.

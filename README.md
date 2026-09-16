# Сайт-портфолио (Vue 3 + Vite)

## Запуск

```bash
npm install
npm run dev         # локальная разработка (http://localhost:5173)
npm run build       # пре-рендер + сборка в dist/ (vite-ssg)
npm run build:spa   # запасной вариант: обычная SPA-сборка без пре-рендера
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
- `image` — путь к скриншоту. Файлы кладите в `public/` (например
  `public/projects/mebel.png` → `"/projects/mebel.png"`). Если оставить пустую
  строку, покажется заглушка «скриншот проекта».
- `link` — если оставить `"#"`, ссылка ведёт наверх страницы; внешние ссылки
  (`https://...`) открываются в новой вкладке.
- `published: false` — проект скрыт, но данные остаются в файле.

## Структура

```
index.html                     точка входа + SEO-теги (домен из .env)
vite.config.js                 Vue, vite-ssg, генерация robots.txt/sitemap.xml
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
- `robots.txt` и `sitemap.xml` генерируются на этапе сборки из того же значения
  (см. `ssgOptions.onFinished` в `vite.config.js`).
- В `index.html` лежат Open Graph/Twitter-теги и JSON-LD (`ProfessionalService`).
- Заглушки, которые видит поисковик: имя/email/telegram в JSON-LD внутри
  `index.html`.

Пре-рендер стоит ~8 КБ gzip JS (head-менеджер и логика гидратации vite-ssg),
но позволяет отдавать контент сразу, без ожидания бандла.

## Что заменить перед публикацией

0. Домен — в `.env` (`VITE_SITE_URL`), затем `npm run build`.
1. Логотип — `public/logo.png` (96×96), шапка — `src/components/TheHeader.vue`,
   соцсети — `TheFooter.vue` (год в копирайте подставляется автоматически).
2. Имя, email и telegram — в JSON-LD внутри `index.html`.
3. Тексты hero — `src/components/HeroSection.vue`.
4. Проекты — `src/data/project-db.json`.
5. Услуги и шаги процесса — массивы `services` и `steps` в
   `ServicesSection.vue` / `ProcessSection.vue`.
6. Контакты — массив `contacts` в `ContactSection.vue`.

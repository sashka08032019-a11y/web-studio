<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useScroll } from "../composables/useScroll.js";
import { useMediaQuery } from "../composables/useMediaQuery.js";

const navLinks = [
  { href: "#work", label: "Портфолио" },
  { href: "#services", label: "Услуги" },
  { href: "#process", label: "Процесс" },
  { href: "#contact", label: "Контакты" },
];

const { isScrolled } = useScroll(40);
const isMobile = useMediaQuery("(max-width: 860px)");
const isMenuOpen = ref(false);
const nav = ref(null);
const toggleButton = ref(null);

// На мобильном закрытое меню убираем из tab-порядка и из дерева доступности
const isNavHidden = computed(() => isMobile.value && !isMenuOpen.value);

const openMenu = () => {
  isMenuOpen.value = true;
  // Переводим фокус в открывшееся меню
  nextTick(() => nav.value?.querySelector("a")?.focus());
};

const closeMenu = (restoreFocus = false) => {
  isMenuOpen.value = false;
  if (restoreFocus) toggleButton.value?.focus();
};

const toggleMenu = () => (isMenuOpen.value ? closeMenu(true) : openMenu());

// Escape закрывает меню
const onKeydown = (event) => {
  if (event.key !== "Escape" || !isMenuOpen.value) return;
  event.preventDefault();
  closeMenu(true);
};

// Блокируем прокрутку страницы под открытым меню
const updateScrollLock = () => {
  document.body.classList.toggle(
    "has-open-menu",
    isMenuOpen.value && isMobile.value,
  );
};

// #top — фиксированный хедер: у него нет позиции в потоке документа,
// поэтому браузеру некуда скроллить. Скроллим наверх вручную.
const scrollToTop = () => {
  isMenuOpen.value = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// При переходе на широкий экран меню закрывается вместе со снятием блокировки
watch([isMenuOpen, isMobile], updateScrollLock);

onMounted(() => window.addEventListener("keydown", onKeydown));
onUnmounted(() => {
  window.removeEventListener("keydown", onKeydown);
  document.body.classList.remove("has-open-menu");
});
</script>

<template>
  <header class="site-header" :class="{ 'is-scrolled': isScrolled }" id="top">
    <div class="header-inner">
      <a href="#top" class="logo" aria-label="На главную, наверх страницы" @click.prevent="scrollToTop">
        <img src="/Logo.svg" alt="Логотип" width="48" height="48" />
      </a>

      <nav
        id="nav"
        ref="nav"
        class="nav"
        :class="{ 'is-open': isMenuOpen }"
        :inert="isNavHidden"
        aria-label="Основная навигация"
      >
        <a
          v-for="link in navLinks"
          :key="link.href"
          :href="link.href"
          @click="closeMenu()"
        >
          {{ link.label }}
        </a>
      </nav>

      <div class="header-actions">
        <a href="#contact" class="btn btn-ghost header-cta">Обсудить проект</a>
        <button
          ref="toggleButton"
          class="nav-toggle"
          type="button"
          :class="{ 'is-active': isMenuOpen }"
          aria-label="Меню"
          :aria-expanded="isMenuOpen"
          aria-controls="nav"
          @click="toggleMenu"
        >
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 24px 0;
  border-bottom: 1px solid transparent;
  transition:
    background 0.3s var(--ease),
    padding 0.3s var(--ease),
    border-color 0.3s var(--ease);
}
.site-header.is-scrolled {
  background: rgba(20, 22, 26, 0.88);
  backdrop-filter: blur(10px);
  padding: 16px 0;
  border-color: var(--line);
}
.header-inner {
  max-width: var(--container);
  margin-inline: auto;
  padding-inline: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}
.logo {
  z-index: 110;
  position: relative;
  display: block;
  line-height: 0;
}
.logo img {
  height: 48px;
  width: 48px;
  transition: transform 0.3s var(--ease);
}
.logo:hover img,
.logo:focus-visible img {
  transform: scale(1.08);
}

/* Металлический блик: световая полоса проходит по лого и обрезана
   по его форме через mask (сам SVG остаётся чётким вектором) */
.logo::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    115deg,
    transparent 42%,
    rgba(255, 255, 255, 0.4) 47%,
    rgba(255, 232, 194, 0.95) 50%,
    rgba(255, 255, 255, 0.4) 53%,
    transparent 58%
  );
  background-size: 300% 100%;
  background-position: 220% 0;
  -webkit-mask: url("/Logo.svg") center / contain no-repeat;
  mask: url("/Logo.svg") center / contain no-repeat;
  animation: logoShine 5.5s var(--ease) infinite;
}

@keyframes logoShine {
  0% {
    background-position: 220% 0;
  }
  55% {
    background-position: -120% 0;
  }
  100% {
    background-position: -120% 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .logo::after {
    animation: none;
    opacity: 0;
  }
  .logo img {
    transition: none;
  }
}
.nav {
  display: flex;
  gap: 32px;
}
.nav a {
  font-size: 0.9rem;
  color: var(--text-muted);
  transition: color 0.2s var(--ease);
}
.nav a:hover,
.nav a:focus-visible {
  color: var(--text);
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}
.nav-toggle {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 26px;
  height: 20px;
  position: relative;
  z-index: 110;
}
.nav-toggle span {
  display: block;
  height: 1px;
  background: var(--text);
  width: 100%;
  transition:
    transform 0.3s var(--ease),
    opacity 0.3s var(--ease);
}
.nav-toggle.is-active span:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}
.nav-toggle.is-active span:nth-child(2) {
  opacity: 0;
}
.nav-toggle.is-active span:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}

@media (max-width: 860px) {
  .nav {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    width: min(320px, 80vw);
    background: var(--bg-alt);
    flex-direction: column;
    padding: 110px 32px 32px;
    gap: 26px;
    transform: translateX(100%);
    /* visibility убирает ссылки из tab-порядка, когда меню закрыто */
    visibility: hidden;
    transition:
      transform 0.35s var(--ease),
      visibility 0s linear 0.35s;
    z-index: 105;
  }
  .nav.is-open {
    transform: translateX(0);
    visibility: visible;
    transition:
      transform 0.35s var(--ease),
      visibility 0s linear 0s;
  }
  @media (prefers-reduced-motion: reduce) {
    .nav {
      transition: none;
    }
  }
  .header-cta {
    display: none;
  }
  .nav-toggle {
    display: flex;
  }
}
</style>

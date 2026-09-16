<script setup>
// Год подставляется автоматически
const year = new Date().getFullYear();

const socials = [{ label: "GitHub", href: "https://github.com/sboevvitalii" }];

// Плавный подъём наверх страницы (с учётом prefers-reduced-motion)
const scrollToTop = () => {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
};
</script>

<template>
  <footer class="site-footer">
    <div class="container footer-inner">
      <span>© {{ year }}</span>

      <div class="footer-links">
        <a
          v-for="social in socials"
          :key="social.label"
          :href="social.href"
          target="_blank"
          rel="noopener"
        >
          {{ social.label }}
        </a>
      </div>

      <button class="to-top" type="button" aria-label="Наверх" title="Наверх" @click="scrollToTop">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M12 19V5"></path>
          <path d="M5 12l7-7 7 7"></path>
        </svg>
      </button>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  border-top: 1px solid var(--line);
  padding: 32px 0;
}
.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 0.85rem;
  color: var(--text-muted);
}
.footer-links {
  display: flex;
  gap: 20px;
}
.footer-links a:hover {
  color: var(--text);
}

/* Прыгающая стрелка «наверх» */
.to-top {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid var(--line-strong);
  border-radius: 50%;
  color: var(--accent);
  transition:
    border-color 0.2s var(--ease),
    background 0.2s var(--ease),
    color 0.2s var(--ease);
}
.to-top:hover,
.to-top:focus-visible {
  border-color: var(--accent);
  background: var(--accent-dim);
  color: var(--accent-strong);
}
.to-top svg {
  width: 18px;
  height: 18px;
  animation: bounceUp 1.6s var(--ease) infinite;
}
.to-top:hover svg,
.to-top:focus-visible svg {
  animation-play-state: paused;
}
@keyframes bounceUp {
  0%,
  100% {
    transform: translateY(3px);
  }
  50% {
    transform: translateY(-3px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .to-top svg {
    animation: none;
  }
}
</style>

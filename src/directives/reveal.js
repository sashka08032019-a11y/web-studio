/**
 * Директива v-reveal: плавно показывает элемент при попадании во вьюпорт.
 * Использует классы .reveal / .is-visible из base.css.
 */
export const reveal = {
  // Пустые пропсы для SSR: при пре-рендере директива ничего не добавляет,
  // класс .reveal вешается только в браузере
  getSSRProps: () => ({}),

  mounted(el, binding) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    el.classList.add("reveal");
    if (binding.value) el.style.transitionDelay = `${binding.value}ms`;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px" },
    );

    observer.observe(el);
    el.__revealObserver = observer;
  },
  unmounted(el) {
    el.__revealObserver?.disconnect();
    delete el.__revealObserver;
  },
};

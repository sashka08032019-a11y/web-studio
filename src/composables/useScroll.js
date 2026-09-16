import { onMounted, onUnmounted, ref } from "vue";

/**
 * Отслеживает прокрутку страницы: отдаёт текущий scrollY
 * и флаг «страница прокручена» (для «залипающей» шапки).
 */
export function useScroll(threshold = 40) {
  const scrollY = ref(0);
  const isScrolled = ref(false);

  const onScroll = () => {
    scrollY.value = window.scrollY;
    isScrolled.value = window.scrollY > threshold;
  };

  onMounted(() => {
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  });

  onUnmounted(() => window.removeEventListener("scroll", onScroll));

  return { scrollY, isScrolled };
}

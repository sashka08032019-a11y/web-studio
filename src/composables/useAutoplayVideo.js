import { onMounted, ref } from "vue";

/**
 * Решает, можно ли включать фоновое видео-автоплей.
 * Отключаем его при reduced-motion, включённой экономии трафика
 * и на медленном соединении — вместо видео останется статичный постер.
 */
export function useAutoplayVideo() {
  const canAutoplay = ref(false);

  onMounted(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    const saveData = connection?.saveData === true;
    const slowNetwork = ["slow-2g", "2g", "3g"].includes(
      connection?.effectiveType,
    );

    canAutoplay.value = !prefersReducedMotion && !saveData && !slowNetwork;
  });

  return { canAutoplay };
}

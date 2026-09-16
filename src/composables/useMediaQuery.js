import { onMounted, onUnmounted, ref } from "vue";

/**
 * Реактивный медиа-запрос: возвращает ref<boolean>, который обновляется
 * при изменении размера окна.
 */
export function useMediaQuery(query) {
  const matches = ref(false);
  let mediaQuery = null;

  const update = (event) => (matches.value = event.matches);

  onMounted(() => {
    mediaQuery = window.matchMedia(query);
    matches.value = mediaQuery.matches;
    mediaQuery.addEventListener("change", update);
  });

  onUnmounted(() => mediaQuery?.removeEventListener("change", update));

  return matches;
}

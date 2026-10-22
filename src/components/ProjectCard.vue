<script setup>
import { computed, ref } from "vue";

const FALLBACK_IMAGE = "/og-image.jpg";

const props = defineProps({
  project: { type: Object, required: true },
});

const imageFailed = ref(false);

const imageSrc = computed(() =>
  imageFailed.value || !props.project.image ? FALLBACK_IMAGE : props.project.image,
);

const isExternal = computed(() =>
  typeof props.project.link === "string"
    ? /^https?:\/\//i.test(props.project.link)
    : false,
);

function onImageError() {
  imageFailed.value = true;
}
</script>

<template>
  <article class="work-card">
    <component
      :is="isExternal ? 'a' : 'div'"
      class="work-thumb"
      :href="isExternal ? project.link : undefined"
      :target="isExternal ? '_blank' : undefined"
      :rel="isExternal ? 'noopener noreferrer' : undefined"
      :aria-label="isExternal ? `${project.title} — открыть сайт в новой вкладке` : undefined"
    >
      <img
        v-if="project.image"
        :src="imageSrc"
        :alt="
          imageFailed
            ? `${project.title} — превью недоступно`
            : project.imageAlt || project.title
        "
        loading="lazy"
        @error="onImageError"
      />
      <span v-else>скриншот проекта</span>
    </component>

    <h3>{{ project.title }}</h3>
    <p>{{ project.description }}</p>

    <div v-if="project.tags?.length" class="work-tags">
      <span v-for="tag in project.tags" :key="tag">{{ tag }}</span>
    </div>

    <a
      v-if="project.link"
      class="work-link"
      :href="project.link"
      :target="isExternal ? '_blank' : undefined"
      :rel="isExternal ? 'noopener noreferrer' : undefined"
    >
      {{ project.linkLabel || "Смотреть проект" }}
    </a>
  </article>
</template>

<style scoped>
.work-card {
  background: var(--bg);
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.work-thumb {
  aspect-ratio: 16/10;
  background: linear-gradient(135deg, var(--bg-alt-2), var(--bg-alt));
  border: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 0.78rem;
  text-align: center;
  padding: 16px;
  overflow: hidden;
}
a.work-thumb {
  padding: 0;
}
a.work-thumb:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
.work-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.45s var(--ease);
}
a.work-thumb:hover img {
  transform: scale(1.03);
}
.work-card h3 {
  font-size: 1.2rem;
}
.work-card p {
  color: var(--text-muted);
  font-size: 0.95rem;
}
.work-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.75rem;
  color: var(--accent);
}
.work-link {
  font-size: 0.9rem;
  border-bottom: 1px solid var(--line-strong);
  padding-bottom: 2px;
  align-self: flex-start;
  transition:
    border-color 0.2s var(--ease),
    color 0.2s var(--ease);
}
.work-link:hover {
  border-color: var(--accent);
  color: var(--accent);
}
</style>

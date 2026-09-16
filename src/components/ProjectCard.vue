<script setup>
defineProps({
  project: { type: Object, required: true },
});
</script>

<template>
  <article class="work-card">
    <div class="work-thumb">
      <img
        v-if="project.image"
        :src="project.image"
        :alt="project.title"
        loading="lazy"
      />
      <span v-else>скриншот проекта</span>
    </div>

    <h3>{{ project.title }}</h3>
    <p>{{ project.description }}</p>

    <div v-if="project.tags?.length" class="work-tags">
      <span v-for="tag in project.tags" :key="tag">{{ tag }}</span>
    </div>

    <a
      v-if="project.link"
      class="work-link"
      :href="project.link"
      :target="project.link.startsWith('http') ? '_blank' : undefined"
      :rel="project.link.startsWith('http') ? 'noopener' : undefined"
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
.work-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

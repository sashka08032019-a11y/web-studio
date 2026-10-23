<script setup>
import { computed } from "vue";
import projectDb from "../data/project-db.json";
import SectionHeader from "./SectionHeader.vue";
import ProjectCard from "./ProjectCard.vue";

// Показываем только проекты с "published": true
const projects = computed(() =>
  (projectDb.projects || []).filter((project) => project.published !== false),
);
</script>

<template>
  <section class="section" id="work">
    <div class="container">
      <SectionHeader
        title="Портфолио"
        note="Сайты, которые я спроектировал и разработал."
      />

      <div class="work-grid">
        <ProjectCard
          v-for="(project, i) in projects"
          :key="project.id"
          v-reveal="i * 80"
          :project="project"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.work-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr));
  gap: 1px;
  background: var(--line);
  border: 1px solid var(--line);
}
</style>

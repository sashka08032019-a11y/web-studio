<script setup>
import SectionHeader from "./SectionHeader.vue";

const services = [
  {
    title: "Лендинги",
    text: "Одностраничный сайт под конкретную задачу: продукт, услугу или событие.",
  },
  {
    title: "Корпоративные сайты",
    text: "Многостраничный сайт с каталогом услуг, блогом и личным кабинетом.",
  },
  {
    title: "Интернет-магазины",
    text: "Каталог, корзина, оплата и интеграция с системами учёта.",
  },
  {
    title: "Поддержка и развитие",
    text: "Доработка существующего сайта, ускорение загрузки, техническая поддержка.",
  },
];
</script>

<template>
  <section class="section section-alt" id="services">
    <div class="container">
      <SectionHeader title="Услуги" />

      <ul class="service-list">
        <li
          v-for="(service, i) in services"
          :key="service.title"
          v-reveal="i * 60"
          class="service-row"
        >
          <h3>{{ service.title }}</h3>
          <p>{{ service.text }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.service-list {
  border-top: 1px solid var(--line);
}
.service-row {
  display: grid;
  grid-template-columns: 1fr 1.6fr;
  gap: 32px;
  padding: 32px 0;
  border-bottom: 1px solid var(--line);
}
.service-row h3 {
  font-size: 1.15rem;
  font-weight: 500;
}
.service-row p {
  color: var(--text-muted);
}
@media (max-width: 720px) {
  .service-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
</style>

<script setup>
import { ref } from "vue";
import SectionHeader from "./SectionHeader.vue";
import AccordionItem from "./AccordionItem.vue";

const steps = [
  {
    title: "Бриф и цели",
    text: "Обсуждаем задачу, аудиторию и результат, который должен дать сайт.",
  },
  {
    title: "Прототип и дизайн",
    text: "Собираю структуру страниц и визуальный стиль, согласовываем до вёрстки.",
  },
  {
    title: "Разработка",
    text: "Вёрстка, логика и адаптивность под все устройства.",
  },
  {
    title: "Тестирование",
    text: "Проверяю скорость загрузки, кроссбраузерность и отображение на разных экранах.",
  },
  {
    title: "Запуск и поддержка",
    text: "Публикую сайт, подключаю аналитику и остаюсь на связи для доработок.",
  },
];

// Открыт только один шаг за раз
const openIndex = ref(0);

const toggle = (index) => {
  openIndex.value = openIndex.value === index ? null : index;
};
</script>

<template>
  <section class="section" id="process">
    <div class="container container-narrow">
      <SectionHeader title="Как я работаю" />

      <div class="accordion">
        <AccordionItem
          v-for="(step, i) in steps"
          :key="step.title"
          :index="i + 1"
          :title="step.title"
          :text="step.text"
          :open="openIndex === i"
          @toggle="toggle(i)"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.accordion {
  border-top: 1px solid var(--line);
}
</style>

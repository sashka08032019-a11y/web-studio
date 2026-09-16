<script setup>
import { nextTick, onMounted, ref, useId, watch } from "vue";

const props = defineProps({
  index: { type: Number, required: true },
  title: { type: String, required: true },
  text: { type: String, required: true },
  open: { type: Boolean, default: false },
});

defineEmits(["toggle"]);

// Уникальные id, чтобы связать кнопку и панель для скринридеров
const uid = useId();
const triggerId = `accordion-trigger-${uid}`;
const panelId = `accordion-panel-${uid}`;

const panel = ref(null);
const panelHeight = ref(0);

const syncHeight = () => {
  if (!panel.value) return;
  panelHeight.value = props.open ? panel.value.scrollHeight : 0;
};

watch(() => props.open, () => nextTick(syncHeight));
onMounted(syncHeight);
</script>

<template>
  <div class="accordion-item" :class="{ 'is-open': open }">
    <button
      :id="triggerId"
      class="accordion-trigger"
      type="button"
      :aria-expanded="open"
      :aria-controls="panelId"
      @click="$emit('toggle')"
    >
      <span class="accordion-index">{{ index }}</span>
      <span class="accordion-title">{{ title }}</span>
      <span class="accordion-icon" aria-hidden="true"></span>
    </button>

    <div
      :id="panelId"
      ref="panel"
      class="accordion-panel"
      role="region"
      :aria-labelledby="triggerId"
      :inert="!open"
      :style="{ maxHeight: panelHeight + 'px' }"
    >
      <div class="accordion-panel-inner">
        <p>{{ text }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.accordion-item {
  border-bottom: 1px solid var(--line);
}
.accordion-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 26px 0;
  text-align: left;
}
.accordion-index {
  font-family: "IBM Plex Mono", monospace;
  color: var(--text-muted);
  font-size: 0.85rem;
  flex-shrink: 0;
}
.accordion-title {
  font-family: "Fraunces", serif;
  font-size: 1.2rem;
  flex: 1;
  transition: color 0.2s var(--ease);
}
.is-open .accordion-title {
  color: var(--accent);
}
.accordion-icon {
  position: relative;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.accordion-icon::before,
.accordion-icon::after {
  content: "";
  position: absolute;
  background: var(--text-muted);
  transition: transform 0.3s var(--ease);
}
.accordion-icon::before {
  top: 50%;
  left: 0;
  width: 100%;
  height: 1px;
  transform: translateY(-50%);
}
.accordion-icon::after {
  left: 50%;
  top: 0;
  width: 1px;
  height: 100%;
  transform: translateX(-50%);
}
.is-open .accordion-icon::after {
  transform: translateX(-50%) scaleY(0);
}
.accordion-panel {
  max-height: 0;
  overflow: hidden;
  /* закрытая панель недоступна для tab и скринридеров */
  visibility: hidden;
  transition:
    max-height 0.35s var(--ease),
    visibility 0s linear 0.35s;
}
.is-open .accordion-panel {
  visibility: visible;
  transition:
    max-height 0.35s var(--ease),
    visibility 0s linear 0s;
}
.accordion-panel-inner {
  padding-bottom: 26px;
  max-width: 60ch;
  color: var(--text-muted);
}
@media (prefers-reduced-motion: reduce) {
  .accordion-panel,
  .is-open .accordion-panel {
    transition: none;
  }
}
</style>

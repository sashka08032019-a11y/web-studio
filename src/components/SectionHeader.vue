<script setup>
defineProps({
  title: { type: String, required: true },
  note: { type: String, default: "" },
});
</script>

<template>
  <div class="section-head">
    <h2>{{ title }}</h2>
    <p v-if="note" class="section-note">{{ note }}</p>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  href: { type: String, required: true },
  label: { type: String, required: true },
  value: { type: String, required: true },
  external: { type: Boolean, default: false },
});
</script>

<template>
  <a
    class="contact-link"
    :href="href"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener' : undefined"
  >
    <slot />
    <span class="contact-meta">
      <span class="contact-label">{{ label }}</span>
      <span class="contact-value">{{ value }}</span>
    </span>
  </a>
</template>

<style scoped>
.contact-link {
  background: var(--bg-alt);
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 22px 24px;
  transition: background 0.2s var(--ease);
}
.contact-link:hover {
  background: var(--bg-alt-2);
}
.contact-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.contact-label {
  font-size: 0.78rem;
  color: var(--text-muted);
}
.contact-value {
  font-size: 1rem;
}
</style>

<script setup>
import ContactLink from "./ContactLink.vue";
import IconMail from "./icons/IconMail.vue";
import IconTelegram from "./icons/IconTelegram.vue";
import IconPhone from "./icons/IconPhone.vue";
import IconWhatsapp from "./icons/IconWhatsapp.vue";

const contacts = [
  {
    id: "email",
    label: "Email",
    value: "Sboev_Vitalii@mail.ru",
    href: "mailto:Sboev_Vitalii@mail.ru",
    icon: IconMail,
  },
  {
    id: "telegram",
    label: "Telegram",
    value: "@Sboev_Vitalii",
    href: "https://t.me/Sboev_Vitalii",
    external: true,
    icon: IconTelegram,
  },
  {
    id: "phone",
    label: "Телефон",
    value: "+7 (707) 745-01-45",
    href: "tel:+77077450145",
    icon: IconPhone,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    value: "+7 (707) 745-01-45",
    href: "https://wa.me/77077450145",
    external: true,
    icon: IconWhatsapp,
  },
];
</script>

<template>
  <section class="section section-contact" id="contact">
    <div class="container container-narrow">
      <h2>Обсудим ваш проект</h2>
      <p>Опишите задачу — отвечу в течение дня.</p>

      <div class="contact-links">
        <ContactLink
          v-for="contact in contacts"
          :key="contact.id"
          :href="contact.href"
          :label="contact.label"
          :value="contact.value"
          :external="contact.external"
        >
          <component :is="contact.icon" />
        </ContactLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section-contact {
  background: var(--bg-alt);
}
.section-contact h2 {
  font-size: clamp(2rem, 4vw, 3rem);
  margin-bottom: 16px;
}
.section-contact p {
  color: var(--text-muted);
  margin-bottom: 40px;
}
.contact-links {
  display: grid;
  gap: 1px;
  background: var(--line);
  border: 1px solid var(--line);
}
@media (min-width: 640px) {
  .contact-links {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
